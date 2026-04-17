import { Effect } from 'effect';

const MINUTES_PER_DAY = 24 * 60;
const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_CATCH_UP_DAYS = 400;

export type RandomizerPeriodicity = 'daily' | 'weekly' | 'monthly';

export type RandomizerWeekday =
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday'
	| 'sunday';

export type RandomizerSchedule = {
	readonly key: string;
	readonly fingerprint: string;
	readonly name: string;
	readonly periodicity: RandomizerPeriodicity;
	readonly windowStart: string;
	readonly windowEnd: string;
	readonly occurrences: number;
	readonly weekdays: readonly RandomizerWeekday[];
	readonly monthDays: readonly number[];
	readonly minimumSpacingMinutes: number;
};

export type PendingOccurrence = {
	readonly occurrenceId: string;
	readonly occurrenceIndex: number;
	readonly occurrencesInWindow: number;
	readonly plannedAt: string;
	readonly scheduleKey: string;
	readonly scheduleName: string;
	readonly periodicity: RandomizerPeriodicity;
	readonly windowStart: string;
	readonly windowEnd: string;
	readonly windowDate: string;
};

export type PersistedScheduleState = {
	readonly fingerprint: string;
	readonly lastGeneratedDate: string;
	readonly pending: readonly PendingOccurrence[];
};

export type RandomizerState = {
	readonly version: 1;
	readonly schedules: Record<string, PersistedScheduleState>;
};

export type EmittedOccurrence = PendingOccurrence & {
	readonly firedAt: string;
};

export type RandomizerError = {
	readonly _tag: 'RandomizerError';
	readonly message: string;
	readonly cause?: unknown;
};

type PlannedWindow = {
	readonly windowDate: string;
	readonly windowStart: Date;
	readonly windowEnd: Date;
};

const weekdayToUtcDay: Record<RandomizerWeekday, number> = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
};

export const createEmptyRandomizerState = (): RandomizerState => ({
	version: 1,
	schedules: {},
});

export const readRandomizerState = (value: unknown): RandomizerState => {
	if (isRandomizerState(value)) {
		return value;
	}

	return createEmptyRandomizerState();
};

export const evaluateRandomizerSchedules = (
	now: Date,
	schedules: readonly RandomizerSchedule[],
	currentState: RandomizerState,
	random: () => number = Math.random,
): Effect.Effect<
	{ readonly state: RandomizerState; readonly emitted: readonly EmittedOccurrence[] },
	RandomizerError
> =>
	tryRandomizerEffect(() => {
	const nextSchedulesState: Record<string, PersistedScheduleState> = {};
	const emitted: EmittedOccurrence[] = [];

	for (const schedule of schedules) {
		const previousState = currentState.schedules[schedule.key];
		const baseState =
			previousState !== undefined && previousState.fingerprint === schedule.fingerprint
				? previousState
				: undefined;
		const evaluation = evaluateSchedule(now, schedule, baseState, random);

		nextSchedulesState[schedule.key] = evaluation.state;
		emitted.push(...evaluation.emitted);
	}

	emitted.sort((left, right) => left.plannedAt.localeCompare(right.plannedAt));

	return {
		state: {
			version: 1,
			schedules: nextSchedulesState,
		},
		emitted,
	};
	});

export const previewRandomizerSchedules = (
	now: Date,
	schedules: readonly RandomizerSchedule[],
	random: () => number = Math.random,
): Effect.Effect<readonly PendingOccurrence[], RandomizerError> =>
	tryRandomizerEffect(() =>
		schedules.flatMap((schedule) => previewSchedule(now, schedule, random)),
	);

const evaluateSchedule = (
	now: Date,
	schedule: RandomizerSchedule,
	state: PersistedScheduleState | undefined,
	random: () => number,
): { readonly state: PersistedScheduleState; readonly emitted: readonly EmittedOccurrence[] } => {
	const currentDate = toUtcDateString(now);
	const generationDates = listGenerationDates(state?.lastGeneratedDate, currentDate);
	const generatedPending = generationDates.flatMap((date) =>
		isScheduleActiveOnDate(schedule, date)
			? generatePendingOccurrencesForDate(schedule, date, random)
			: [],
	);
	const pending = [...(state?.pending ?? []), ...generatedPending];
	const emitted = pending
		.filter((occurrence) => Date.parse(occurrence.plannedAt) <= now.getTime())
		.map((occurrence) => ({
			...occurrence,
			firedAt: now.toISOString(),
		}));
	const remainingPending = pending.filter(
		(occurrence) => Date.parse(occurrence.plannedAt) > now.getTime(),
	);

	return {
		state: {
			fingerprint: schedule.fingerprint,
			lastGeneratedDate: currentDate,
			pending: remainingPending,
		},
		emitted,
	};
};

const previewSchedule = (
	now: Date,
	schedule: RandomizerSchedule,
	random: () => number,
): readonly PendingOccurrence[] => {
	const today = startOfUtcDay(now);

	for (let offset = 0; offset < 366; offset++) {
		const candidate = new Date(today.getTime() + offset * MILLISECONDS_PER_DAY);
		const candidateDate = toUtcDateString(candidate);

		if (!isScheduleActiveOnDate(schedule, candidateDate)) {
			continue;
		}

		const window = buildPlannedWindow(schedule, candidateDate);
		if (offset === 0 && window.windowEnd.getTime() < now.getTime()) {
			continue;
		}

		return generatePendingOccurrencesForDate(schedule, candidateDate, random);
	}

	return [];
};

const listGenerationDates = (
	lastGeneratedDate: string | undefined,
	currentDate: string,
): readonly string[] => {
	if (lastGeneratedDate === undefined) {
		return [currentDate];
	}

	const startDate = addDays(lastGeneratedDate, 1);
	const daySpan = diffDays(startDate, currentDate);

	if (daySpan < 0) {
		return [];
	}

	const effectiveStartDate =
		daySpan + 1 > MAX_CATCH_UP_DAYS
			? addDays(currentDate, -(MAX_CATCH_UP_DAYS - 1))
			: startDate;
	const effectiveDaySpan = diffDays(effectiveStartDate, currentDate);

	return Array.from({ length: effectiveDaySpan + 1 }, (_, index) =>
		addDays(effectiveStartDate, index),
	);
};

const generatePendingOccurrencesForDate = (
	schedule: RandomizerSchedule,
	windowDate: string,
	random: () => number,
): readonly PendingOccurrence[] => {
	const window = buildPlannedWindow(schedule, windowDate);
	const minuteOffsets = pickMinuteOffsets(
		countWindowMinutes(window),
		schedule.occurrences,
		schedule.minimumSpacingMinutes,
		random,
	).sort((left, right) => left - right);

	return minuteOffsets.map((minuteOffset, index) => {
		const plannedAt = new Date(
			window.windowStart.getTime() + minuteOffset * MILLISECONDS_PER_MINUTE,
		);

		return {
			occurrenceId: `${schedule.key}:${windowDate}:${index + 1}`,
			occurrenceIndex: index + 1,
			occurrencesInWindow: schedule.occurrences,
			plannedAt: plannedAt.toISOString(),
			scheduleKey: schedule.key,
			scheduleName: schedule.name,
			periodicity: schedule.periodicity,
			windowStart: window.windowStart.toISOString(),
			windowEnd: window.windowEnd.toISOString(),
			windowDate,
		};
	});
};

const buildPlannedWindow = (
	schedule: RandomizerSchedule,
	windowDate: string,
): PlannedWindow => {
	const startMinute = parseTimeToMinuteIndex(schedule.windowStart);
	const endMinute = parseTimeToMinuteIndex(schedule.windowEnd);

	if (endMinute <= startMinute) {
		throw new Error('Window End must be later than Window Start');
	}

	const [year, month, day] = windowDate.split('-').map(Number);

	return {
		windowDate,
		windowStart: new Date(
			Date.UTC(year, month - 1, day, Math.floor(startMinute / 60), startMinute % 60),
		),
		windowEnd: new Date(
			Date.UTC(year, month - 1, day, Math.floor(endMinute / 60), endMinute % 60),
		),
	};
};

const countWindowMinutes = (window: PlannedWindow): number =>
	Math.floor((window.windowEnd.getTime() - window.windowStart.getTime()) / MILLISECONDS_PER_MINUTE) + 1;

const pickMinuteOffsets = (
	availableMinutes: number,
	occurrences: number,
	minimumSpacingMinutes: number,
	random: () => number,
): readonly number[] => {
	if (!Number.isInteger(occurrences) || occurrences < 1) {
		throw new Error('Occurrences must be a positive integer');
	}

	if (!Number.isInteger(minimumSpacingMinutes) || minimumSpacingMinutes < 0) {
		throw new Error('Minimum Spacing Minutes must be zero or greater');
	}

	const theoreticalMaximum =
		minimumSpacingMinutes === 0
			? availableMinutes
			: Math.floor((availableMinutes - 1) / minimumSpacingMinutes) + 1;

	if (occurrences > theoreticalMaximum) {
		throw new Error('Schedule window is too small for the requested occurrences and spacing');
	}

	for (let attempt = 0; attempt < 250; attempt++) {
		const accepted: number[] = [];
		const candidates = Array.from({ length: availableMinutes }, (_, index) => index);

		while (accepted.length < occurrences && candidates.length > 0) {
			const candidateIndex = randomInt(candidates.length, random);
			const [candidate] = candidates.splice(candidateIndex, 1);

			accepted.push(candidate);

			for (let index = candidates.length - 1; index >= 0; index--) {
				if (Math.abs(candidates[index] - candidate) < minimumSpacingMinutes) {
					candidates.splice(index, 1);
				}
			}
		}

		if (accepted.length === occurrences) {
			return accepted;
		}
	}

	throw new Error('Unable to generate random occurrences for the requested schedule');
};

const randomInt = (maxExclusive: number, random: () => number): number =>
	Math.min(Math.floor(random() * maxExclusive), maxExclusive - 1);

const isScheduleActiveOnDate = (
	schedule: RandomizerSchedule,
	windowDate: string,
): boolean => {
	const date = parseUtcDateString(windowDate);

	switch (schedule.periodicity) {
		case 'daily':
			return true;
		case 'weekly':
			return schedule.weekdays.some((weekday) => weekdayToUtcDay[weekday] === date.getUTCDay());
		case 'monthly':
			return schedule.monthDays.includes(date.getUTCDate());
	}
};

const parseTimeToMinuteIndex = (value: string): number => {
	const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

	if (match === null) {
		throw new Error('Time values must use HH:mm in UTC');
	}

	return Number(match[1]) * 60 + Number(match[2]);
};

const toUtcDateString = (date: Date): string => date.toISOString().slice(0, 10);

const parseUtcDateString = (value: string): Date => {
	const [year, month, day] = value.split('-').map(Number);

	return new Date(Date.UTC(year, month - 1, day));
};

const startOfUtcDay = (date: Date): Date =>
	new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addDays = (date: string, days: number): string =>
	toUtcDateString(new Date(parseUtcDateString(date).getTime() + days * MILLISECONDS_PER_DAY));

const diffDays = (left: string, right: string): number =>
	Math.floor(
		(parseUtcDateString(right).getTime() - parseUtcDateString(left).getTime()) /
			MILLISECONDS_PER_DAY,
	);

const isRandomizerState = (value: unknown): value is RandomizerState => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const candidate = value as Partial<RandomizerState>;

	return candidate.version === 1 && typeof candidate.schedules === 'object' && candidate.schedules !== null;
};

export const sanitizeMonthDays = (
	value: string,
): Effect.Effect<readonly number[], RandomizerError> =>
	tryRandomizerEffect(() => {
	const uniqueDays = new Set<number>();

	for (const rawPart of value.split(',')) {
		const trimmedPart = rawPart.trim();

		if (trimmedPart.length === 0) {
			continue;
		}

		const day = Number(trimmedPart);

		if (!Number.isInteger(day) || day < 1 || day > 31) {
			throw new Error('Month Days must contain comma-separated integers between 1 and 31');
		}

		uniqueDays.add(day);
	}

	return [...uniqueDays].sort((left, right) => left - right);
	});

export const sanitizeWeekdays = (value: unknown): readonly RandomizerWeekday[] => {
	if (!Array.isArray(value)) {
		return [];
	}

	const validWeekdays = new Set<RandomizerWeekday>();

	for (const weekday of value) {
		if (
			weekday === 'monday' ||
			weekday === 'tuesday' ||
			weekday === 'wednesday' ||
			weekday === 'thursday' ||
			weekday === 'friday' ||
			weekday === 'saturday' ||
			weekday === 'sunday'
		) {
			validWeekdays.add(weekday);
		}
	}

	return [...validWeekdays];
};

export const createScheduleFingerprint = (
	schedule: Omit<RandomizerSchedule, 'fingerprint'>,
): string =>
	JSON.stringify({
		name: schedule.name,
		periodicity: schedule.periodicity,
		windowStart: schedule.windowStart,
		windowEnd: schedule.windowEnd,
		occurrences: schedule.occurrences,
		weekdays: schedule.weekdays,
		monthDays: schedule.monthDays,
		minimumSpacingMinutes: schedule.minimumSpacingMinutes,
	});

export const validateSchedule = (
	schedule: Omit<RandomizerSchedule, 'fingerprint'>,
): Effect.Effect<RandomizerSchedule, RandomizerError> =>
	tryRandomizerEffect(() => {
	if (schedule.name.trim().length === 0) {
		throw new Error('Schedule Name is required');
	}

	parseTimeToMinuteIndex(schedule.windowStart);
	parseTimeToMinuteIndex(schedule.windowEnd);
	buildPlannedWindow(
		{
			...schedule,
			fingerprint: '',
		},
		'2026-01-01',
	);

	if (!Number.isInteger(schedule.occurrences) || schedule.occurrences < 1) {
		throw new Error('Occurrences must be a positive integer');
	}

	if (!Number.isInteger(schedule.minimumSpacingMinutes) || schedule.minimumSpacingMinutes < 0) {
		throw new Error('Minimum Spacing Minutes must be zero or greater');
	}

	if (schedule.periodicity === 'weekly' && schedule.weekdays.length === 0) {
		throw new Error('Weekly schedules require at least one weekday');
	}

	if (schedule.periodicity === 'monthly' && schedule.monthDays.length === 0) {
		throw new Error('Monthly schedules require at least one month day');
	}

	return {
		...schedule,
		fingerprint: createScheduleFingerprint(schedule),
	};
	});

export const defaultWeekdays: readonly RandomizerWeekday[] = ['monday'];
export const defaultMonthDays: readonly number[] = [1];
export const maxMinutesPerDay = MINUTES_PER_DAY;

const tryRandomizerEffect = <A>(thunk: () => A): Effect.Effect<A, RandomizerError> =>
	Effect.try({
		try: thunk,
		catch: (cause) => ({
			_tag: 'RandomizerError',
			message:
				cause instanceof Error ? cause.message : 'Randomizer scheduling failed',
			cause,
		}),
	});
