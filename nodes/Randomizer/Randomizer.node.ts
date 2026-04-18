import type {
	INodeType,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { Effect, Either } from 'effect';

import {
	defaultMonthDays,
	defaultWeekdays,
	evaluateRandomizerSchedules,
	makeRandomizerClock,
	makeRandomizerEntropy,
	previewRandomizerSchedules,
	RandomizerClock,
	RandomizerEntropy,
	readRandomizerState,
	sanitizeMonthDays,
	sanitizeWeekdays,
	type RandomizerError,
	type RandomizerSchedule,
	type EmittedOccurrence,
	validateSchedule,
} from '../shared/randomizer';
import {
	RandomizerScheduleCollectionSchema,
	type RandomizerScheduleCollection,
} from './schema';
import * as Schema from 'effect/Schema';

const MINUTE_CRON_EXPRESSION = '0 * * * * *';
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
	const value = String(hour).padStart(2, '0');

	return {
		name: value,
		value,
	};
});
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, minute) => {
	const value = String(minute).padStart(2, '0');

	return {
		name: value,
		value,
	};
});
const getSupportedTimeZones = (): string[] => {
	const supportedValuesOf = (
		Intl as typeof Intl & { supportedValuesOf?: (key: 'timeZone') => string[] }
	).supportedValuesOf;

	if (supportedValuesOf === undefined) {
		return ['UTC'];
	}

	return ['UTC', ...supportedValuesOf('timeZone').filter((timeZone: string) => timeZone !== 'UTC')];
};

const TIMEZONE_OPTIONS = getSupportedTimeZones().map((timeZone) => ({
		name: timeZone,
		value: timeZone,
	}));

export class Randomizer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Randomizer',
		name: 'randomizer',
		icon: {
			light: 'file:../SubstackGateway/substackGateway.svg',
			dark: 'file:../SubstackGateway/substackGateway.dark.svg',
		},
		group: ['trigger'],
		version: 1,
		subtitle:
			'={{(($parameter["schedules"]?.schedule ?? []).length || 0) + " schedule" + ((($parameter["schedules"]?.schedule ?? []).length || 0) === 1 ? "" : "s")}}',
		description: 'Fire random trigger events inside configured schedule windows',
		defaults: {
			name: 'Randomizer',
		},
		eventTriggerDescription: 'Runs when one or more generated random times become due',
		activationMessage:
			'Your randomizer trigger will now create random fire times based on the schedules you defined.',
		usableAsTool: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Schedules',
				name: 'schedules',
				type: 'fixedCollection',
				noDataExpression: true,
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Schedule',
				default: {
					schedule: [
						{
							windowStartHour: '10',
							windowStartMinute: '00',
							windowEndHour: '13',
							windowEndMinute: '17',
						},
					],
				},
				options: [
					{
						name: 'schedule',
						displayName: 'Schedule',
						values: [
							{
								displayName: '1. Window Start Hour',
								name: 'windowStartHour',
								type: 'options',
								required: true,
								default: '10',
								options: HOUR_OPTIONS,
								description: 'Hour when the random window starts in the selected timezone',
							},
							{
								displayName: '1. Window Start Minute',
								name: 'windowStartMinute',
								type: 'options',
								required: true,
								default: '00',
								options: MINUTE_OPTIONS,
								description: 'Minute when the random window starts in the selected timezone',
							},
							{
								displayName: '2. Window End Hour',
								name: 'windowEndHour',
								type: 'options',
								required: true,
								default: '13',
								options: HOUR_OPTIONS,
								description:
									'Hour when the random window ends in the selected timezone. If earlier than the start hour, the window ends on the next day.',
							},
							{
								displayName: '2. Window End Minute',
								name: 'windowEndMinute',
								type: 'options',
								required: true,
								default: '17',
								options: MINUTE_OPTIONS,
								description:
									'Minute when the random window ends in the selected timezone. If the end time is earlier than the start time, the window ends on the next day.',
							},
							{
								displayName: 'Parameters',
								name: 'parameters',
								type: 'collection',
								placeholder: 'Add Parameter',
								default: {},
								options: [
									{
										displayName: 'Minimum Spacing (Minutes)',
										name: 'minimumSpacingMinutes',
										type: 'number',
										typeOptions: {
											minValue: 0,
										},
										default: 0,
										description:
											'Minimum number of minutes between random trigger fires in the same schedule window',
									},
									{
										displayName: 'Month Days',
										name: 'monthDays',
										type: 'string',
										default: defaultMonthDays.join(','),
										displayOptions: {
											show: {
												periodicity: ['monthly'],
											},
										},
										description:
											'Comma-separated month days from 1 to 31, for example 1,15,28',
									},
									{
										displayName: 'Periodicity',
										name: 'periodicity',
										type: 'options',
										noDataExpression: true,
										default: 'daily',
										options: [
											{
												name: 'Daily',
												value: 'daily',
											},
											{
												name: 'Weekly',
												value: 'weekly',
											},
											{
												name: 'Monthly',
												value: 'monthly',
											},
										],
										description:
											'How often to create a fresh random schedule window in the selected timezone',
									},
									{
										displayName: 'Schedule Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Friendly label included in emitted items. Defaults to Schedule N.',
									},
									{
										displayName: 'Times Per Window',
										name: 'occurrences',
										type: 'number',
										typeOptions: {
											minValue: 1,
										},
										default: 1,
										description:
											'How many random trigger fires to create inside each matching window',
									},
									{
										displayName: 'Timezone',
										name: 'timezone',
										type: 'options',
										default: 'UTC',
										options: TIMEZONE_OPTIONS,
										description:
											'Timezone used to interpret the schedule window and recurrence rules',
									},
									{
										displayName: 'Weekdays',
										name: 'weekdays',
										type: 'multiOptions',
										default: [...defaultWeekdays],
										displayOptions: {
											show: {
												periodicity: ['weekly'],
											},
										},
										options: [
											{ name: 'Friday', value: 'friday' },
											{ name: 'Monday', value: 'monday' },
											{ name: 'Saturday', value: 'saturday' },
											{ name: 'Sunday', value: 'sunday' },
											{ name: 'Thursday', value: 'thursday' },
											{ name: 'Tuesday', value: 'tuesday' },
											{ name: 'Wednesday', value: 'wednesday' },
										],
										description:
											'Weekdays in the selected timezone to use when Periodicity is Weekly',
									},
								],
							},
						],
					},
				],
				description:
					'Create one or more schedules. Windows may cross midnight. Manual execution previews only the next planned random fire time instead of waiting for it.',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const schedules = await runRandomizerEffect(this, getSchedules(this));
		const pollState = this.getWorkflowStaticData('node') as JsonObject;
		const emitOccurrences = (occurrences: readonly EmittedOccurrence[]) => {
			if (occurrences.length === 0) {
				return;
			}

			this.emit([
				occurrences.map((occurrence) => ({
					json: occurrence,
				})),
			]);
			};
			const evaluateAndEmit = () => {
				const now = new Date();
				void Effect.runPromise(
					provideSchedulerServices(
						Effect.flatMap(readRandomizerState(pollState.randomizer), (currentState) =>
							Effect.tap(
								evaluateRandomizerSchedules(schedules, currentState),
								(evaluation) =>
									Effect.sync(() => {
										pollState.randomizer = evaluation.state as unknown as JsonObject;
										emitOccurrences(evaluation.emitted);
									}),
							),
						),
						now,
					),
				).catch((error: RandomizerError) => {
					this.emitError(new NodeOperationError(this.getNode(), error.message));
				});
			};

		if (this.getMode() !== 'manual') {
			this.helpers.registerCron({ expression: MINUTE_CRON_EXPRESSION }, evaluateAndEmit);

			return {};
		}

		const manualTriggerFunction = async () => {
			const previewGeneratedAt = new Date();
			const nextPreviewOccurrence = await runRandomizerEffect(
				this,
				provideSchedulerServices(
					Effect.map(previewRandomizerSchedules(schedules), (occurrences) =>
						occurrences.reduce<typeof occurrences[number] | undefined>(
							(currentEarliest, occurrence) => {
								if (
									currentEarliest === undefined ||
									occurrence.plannedAt.localeCompare(currentEarliest.plannedAt) < 0
								) {
									return occurrence;
								}

								return currentEarliest;
							},
							undefined,
						),
					),
					previewGeneratedAt,
				),
			);
			const previewOccurrences = await runRandomizerEffect(
				this,
				provideSchedulerServices(previewRandomizerSchedules(schedules), previewGeneratedAt),
			);

			if (nextPreviewOccurrence !== undefined) {
				const scheduleOccurrences = previewOccurrences.filter(
					(occurrence) =>
						occurrence.scheduleKey === nextPreviewOccurrence.scheduleKey &&
						occurrence.windowDate === nextPreviewOccurrence.windowDate,
				);
				this.emit([
					[
						{
							json: {
								...nextPreviewOccurrence,
								preview: true,
								previewType: 'next_planned_occurrence',
								previewGeneratedAt: previewGeneratedAt.toISOString(),
								previewScheduleCount: schedules.length,
								previewOccurrencesInWindow: scheduleOccurrences.length,
								previewRemainingOccurrencesInWindow: Math.max(
									nextPreviewOccurrence.occurrencesInWindow -
										nextPreviewOccurrence.occurrenceIndex,
									0,
								),
								previewNote:
									'Manual execution previews the next planned random occurrence only',
							},
						},
					],
				]);
			}
		};

		return { manualTriggerFunction };
	}
}

const getSchedules = (
	context: ITriggerFunctions,
): Effect.Effect<readonly RandomizerSchedule[], RandomizerError> => {
	return Effect.flatMap(readRandomizerInput(context), (input) => {
		const schedules = input.schedule ?? [];

		if (schedules.length === 0) {
			return Effect.fail(toRandomizerError('At least one schedule is required'));
		}

		return Effect.forEach(schedules, (schedule, index) =>
			Effect.flatMap(sanitizeMonthDays(String(schedule.parameters?.monthDays ?? '')), (monthDays) =>
				Effect.flatMap(sanitizeWeekdays(schedule.parameters?.weekdays), (weekdays) =>
					validateSchedule({
						key: `schedule-${index}`,
						name: getScheduleName(schedule.parameters?.name, index),
						periodicity: schedule.parameters?.periodicity ?? 'daily',
						timezone: String(schedule.parameters?.timezone ?? 'UTC'),
						windowStart: toUtcTimeString(schedule.windowStartHour, schedule.windowStartMinute),
						windowEnd: toUtcTimeString(schedule.windowEndHour, schedule.windowEndMinute),
						occurrences: Number(schedule.parameters?.occurrences ?? 1),
						weekdays,
						monthDays,
						minimumSpacingMinutes: Number(schedule.parameters?.minimumSpacingMinutes ?? 0),
					}),
				),
			),
		);
	});
};

const toUtcTimeString = (hour: string | undefined, minute: string | undefined): string =>
	`${String(hour ?? '').padStart(2, '0')}:${String(minute ?? '').padStart(2, '0')}`;

const getScheduleName = (value: string | undefined, index: number): string => {
	const trimmedValue = String(value ?? '').trim();

	return trimmedValue.length > 0 ? trimmedValue : `Schedule ${index + 1}`;
};

const runRandomizerEffect = <A, R>(
	context: ITriggerFunctions,
	effect: Effect.Effect<A, RandomizerError, R>,
): Promise<A> =>
	Effect.runPromise(effect as Effect.Effect<A, RandomizerError>).catch(
		(error: RandomizerError) => {
		throw new NodeOperationError(context.getNode(), error.message);
		},
	);

const provideSchedulerServices = <A, R>(
	effect: Effect.Effect<A, RandomizerError, R>,
	now: Date,
): Effect.Effect<A, RandomizerError> =>
	Effect.provideService(
		Effect.provideService(effect, RandomizerClock, makeRandomizerClock(now)),
		RandomizerEntropy,
		makeRandomizerEntropy(Math.random),
	) as Effect.Effect<A, RandomizerError>;

const readRandomizerInput = (
	context: ITriggerFunctions,
): Effect.Effect<RandomizerScheduleCollection, RandomizerError> =>
	Effect.try({
		try: () => context.getNodeParameter('schedules'),
		catch: (cause) =>
			toRandomizerError(
				cause instanceof Error ? cause.message : 'Unable to read Randomizer parameters',
				cause,
			),
	}).pipe(
		Effect.flatMap((input) => {
			const decoded = Schema.decodeUnknownEither(RandomizerScheduleCollectionSchema)(input);

			return Either.isRight(decoded)
				? Effect.succeed(decoded.right)
				: Effect.fail(toRandomizerError('Invalid Randomizer parameters', decoded.left));
		}),
	);

const toRandomizerError = (message: string, cause?: unknown): RandomizerError => ({
	_tag: 'RandomizerError',
	message,
	cause,
});
