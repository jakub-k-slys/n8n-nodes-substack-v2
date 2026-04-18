import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Effect } from 'effect';

import {
	createEmptyRandomizerState,
	decodeRandomizerState,
	evaluateRandomizerSchedules,
	makeRandomizerClock,
	makeRandomizerEntropy,
	previewRandomizerSchedules,
	RandomizerClock,
	RandomizerEntropy,
	readRandomizerState,
	validateSchedule,
} from '../nodes/shared/randomizer/index.ts';

const fixedRandom = (value: number) => () => value;
const runWithServices = <A>(
	effect: Effect.Effect<A, unknown, typeof RandomizerClock | typeof RandomizerEntropy>,
	now: Date,
	random: () => number,
) =>
	Effect.runSync(
		Effect.provideService(
			Effect.provideService(effect, RandomizerClock, makeRandomizerClock(now)),
			RandomizerEntropy,
			makeRandomizerEntropy(random),
		),
	);

describe('randomizer scheduler', () => {
	it('should emit three daily occurrences inside the configured UTC window', () => {
		const schedule = Effect.runSync(
			validateSchedule({
			key: 'schedule-0',
			name: 'Daily Window',
			periodicity: 'daily',
			timezone: 'UTC',
			windowStart: '10:00',
			windowEnd: '13:17',
			occurrences: 3,
			weekdays: [],
			monthDays: [],
			minimumSpacingMinutes: 0,
			}),
		);

		const firstPoll = runWithServices(
			evaluateRandomizerSchedules(
			[schedule],
			createEmptyRandomizerState(),
			),
			new Date('2026-04-17T09:00:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(firstPoll.emitted.length, 0);
		assert.equal(firstPoll.state.schedules['schedule-0']?.pending.length, 3);

		const secondPoll = runWithServices(
			evaluateRandomizerSchedules(
			[schedule],
			firstPoll.state,
			),
			new Date('2026-04-17T10:02:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(secondPoll.emitted.length, 3);
		assert.deepEqual(
			secondPoll.emitted.map((occurrence) => occurrence.plannedAt),
			[
				'2026-04-17T10:00:00.000Z',
				'2026-04-17T10:01:00.000Z',
				'2026-04-17T10:02:00.000Z',
			],
		);
		assert.equal(secondPoll.state.schedules['schedule-0']?.pending.length, 0);
	});

	it('should generate weekly windows only on configured weekdays', () => {
		const schedule = Effect.runSync(
			validateSchedule({
			key: 'schedule-0',
			name: 'Weekly Window',
			periodicity: 'weekly',
			timezone: 'UTC',
			windowStart: '12:00',
			windowEnd: '12:30',
			occurrences: 1,
			weekdays: ['monday'],
			monthDays: [],
			minimumSpacingMinutes: 0,
			}),
		);

		const fridayPoll = runWithServices(
			evaluateRandomizerSchedules(
			[schedule],
			createEmptyRandomizerState(),
			),
			new Date('2026-04-17T12:30:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(fridayPoll.emitted.length, 0);

		const mondayPoll = runWithServices(
			evaluateRandomizerSchedules(
			[schedule],
			fridayPoll.state,
			),
			new Date('2026-04-20T12:00:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(mondayPoll.emitted.length, 1);
		assert.equal(mondayPoll.emitted[0]?.plannedAt, '2026-04-20T12:00:00.000Z');
	});

	it('should generate monthly windows only on configured month days', () => {
		const schedule = Effect.runSync(
			validateSchedule({
			key: 'schedule-0',
			name: 'Monthly Window',
			periodicity: 'monthly',
			timezone: 'UTC',
			windowStart: '08:00',
			windowEnd: '08:30',
			occurrences: 1,
			weekdays: [],
			monthDays: [15],
			minimumSpacingMinutes: 0,
			}),
		);

		const firstPoll = runWithServices(
			evaluateRandomizerSchedules(
			[schedule],
			createEmptyRandomizerState(),
			),
			new Date('2026-04-14T09:00:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(firstPoll.emitted.length, 0);

		const secondPoll = runWithServices(
			evaluateRandomizerSchedules(
			[schedule],
			firstPoll.state,
			),
			new Date('2026-04-15T08:00:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(secondPoll.emitted.length, 1);
		assert.equal(secondPoll.emitted[0]?.plannedAt, '2026-04-15T08:00:00.000Z');
	});

	it('should preview the next applicable window in manual mode', () => {
		const schedule = Effect.runSync(
			validateSchedule({
			key: 'schedule-0',
			name: 'Preview Window',
			periodicity: 'daily',
			timezone: 'UTC',
			windowStart: '10:00',
			windowEnd: '10:10',
			occurrences: 2,
			weekdays: [],
			monthDays: [],
			minimumSpacingMinutes: 0,
			}),
		);

		const preview = runWithServices(
			previewRandomizerSchedules([schedule]),
			new Date('2026-04-17T11:00:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(preview.length, 2);
		assert.deepEqual(
			preview.map((occurrence) => occurrence.plannedAt),
			['2026-04-18T10:00:00.000Z', '2026-04-18T10:01:00.000Z'],
		);
	});

	it('should support windows that end on the next UTC day', () => {
		const schedule = Effect.runSync(
			validateSchedule({
				key: 'schedule-0',
				name: 'Night Window',
				periodicity: 'daily',
				timezone: 'UTC',
				windowStart: '22:47',
				windowEnd: '02:39',
				occurrences: 2,
				weekdays: [],
				monthDays: [],
				minimumSpacingMinutes: 0,
			}),
		);

		const firstPoll = runWithServices(
			evaluateRandomizerSchedules([schedule], createEmptyRandomizerState()),
			new Date('2026-04-17T22:46:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(firstPoll.emitted.length, 0);
		assert.deepEqual(
			firstPoll.state.schedules['schedule-0']?.pending.map((occurrence) => occurrence.plannedAt),
			['2026-04-17T22:47:00.000Z', '2026-04-17T22:48:00.000Z'],
		);

		const secondPoll = runWithServices(
			evaluateRandomizerSchedules([schedule], firstPoll.state),
			new Date('2026-04-17T22:48:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(secondPoll.emitted.length, 2);
		assert.equal(
			secondPoll.emitted[0]?.windowEnd,
			'2026-04-18T02:39:00.000Z',
		);
	});

	it('should preview a cross-midnight window', () => {
		const schedule = Effect.runSync(
			validateSchedule({
				key: 'schedule-0',
				name: 'Night Preview',
				periodicity: 'daily',
				timezone: 'UTC',
				windowStart: '22:47',
				windowEnd: '02:39',
				occurrences: 1,
				weekdays: [],
				monthDays: [],
				minimumSpacingMinutes: 0,
			}),
		);

		const preview = runWithServices(
			previewRandomizerSchedules([schedule]),
			new Date('2026-04-17T21:00:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(preview.length, 1);
		assert.equal(preview[0]?.windowStart, '2026-04-17T22:47:00.000Z');
		assert.equal(preview[0]?.windowEnd, '2026-04-18T02:39:00.000Z');
		assert.equal(preview[0]?.plannedAt, '2026-04-17T22:47:00.000Z');
	});

	it('should interpret window times in the configured timezone', () => {
		const schedule = Effect.runSync(
			validateSchedule({
				key: 'schedule-0',
				name: 'Warsaw Morning',
				periodicity: 'daily',
				timezone: 'Europe/Warsaw',
				windowStart: '10:00',
				windowEnd: '10:10',
				occurrences: 1,
				weekdays: [],
				monthDays: [],
				minimumSpacingMinutes: 0,
			}),
		);

		const poll = runWithServices(
			evaluateRandomizerSchedules([schedule], createEmptyRandomizerState()),
			new Date('2026-01-15T09:00:00.000Z'),
			fixedRandom(0),
		);

		assert.equal(poll.emitted.length, 1);
		assert.equal(poll.emitted[0]?.plannedAt, '2026-01-15T09:00:00.000Z');
		assert.equal(poll.emitted[0]?.windowStart, '2026-01-15T09:00:00.000Z');
		assert.equal(poll.emitted[0]?.windowEnd, '2026-01-15T09:10:00.000Z');
		assert.equal(poll.emitted[0]?.timezone, 'Europe/Warsaw');
	});

	it('should decode persisted randomizer state', () => {
		const decoded = Effect.runSync(
			decodeRandomizerState({
				version: 1,
				schedules: {
					'schedule-0': {
						fingerprint: 'fingerprint',
						lastGeneratedDate: '2026-04-17',
						pending: [
							{
								occurrenceId: 'schedule-0:2026-04-18:1',
								occurrenceIndex: 1,
								occurrencesInWindow: 3,
								plannedAt: '2026-04-18T10:00:00.000Z',
								scheduleKey: 'schedule-0',
								scheduleName: 'Daily Window',
								periodicity: 'daily',
								timezone: 'UTC',
								windowStart: '2026-04-18T10:00:00.000Z',
								windowEnd: '2026-04-18T13:17:00.000Z',
								windowDate: '2026-04-18',
							},
						],
					},
				},
			}),
		);

		assert.equal(decoded.schedules['schedule-0']?.pending.length, 1);
	});

	it('should fall back to an empty state for invalid persisted state', () => {
		const decoded = Effect.runSync(readRandomizerState({ version: 99 }));

		assert.deepEqual(decoded, createEmptyRandomizerState());
	});
});
