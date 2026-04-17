import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Effect } from 'effect';

import {
	createEmptyRandomizerState,
	evaluateRandomizerSchedules,
	previewRandomizerSchedules,
	validateSchedule,
} from '../nodes/shared/randomizer/index.ts';

const fixedRandom = (value: number) => () => value;

describe('randomizer scheduler', () => {
	it('should emit three daily occurrences inside the configured UTC window', () => {
		const schedule = Effect.runSync(
			validateSchedule({
			key: 'schedule-0',
			name: 'Daily Window',
			periodicity: 'daily',
			windowStart: '10:00',
			windowEnd: '13:17',
			occurrences: 3,
			weekdays: [],
			monthDays: [],
			minimumSpacingMinutes: 0,
			}),
		);

		const firstPoll = Effect.runSync(evaluateRandomizerSchedules(
			new Date('2026-04-17T09:00:00.000Z'),
			[schedule],
			createEmptyRandomizerState(),
			fixedRandom(0),
		));

		assert.equal(firstPoll.emitted.length, 0);
		assert.equal(firstPoll.state.schedules['schedule-0']?.pending.length, 3);

		const secondPoll = Effect.runSync(evaluateRandomizerSchedules(
			new Date('2026-04-17T10:02:00.000Z'),
			[schedule],
			firstPoll.state,
			fixedRandom(0),
		));

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
			windowStart: '12:00',
			windowEnd: '12:30',
			occurrences: 1,
			weekdays: ['monday'],
			monthDays: [],
			minimumSpacingMinutes: 0,
			}),
		);

		const fridayPoll = Effect.runSync(evaluateRandomizerSchedules(
			new Date('2026-04-17T12:30:00.000Z'),
			[schedule],
			createEmptyRandomizerState(),
			fixedRandom(0),
		));

		assert.equal(fridayPoll.emitted.length, 0);

		const mondayPoll = Effect.runSync(evaluateRandomizerSchedules(
			new Date('2026-04-20T12:00:00.000Z'),
			[schedule],
			fridayPoll.state,
			fixedRandom(0),
		));

		assert.equal(mondayPoll.emitted.length, 1);
		assert.equal(mondayPoll.emitted[0]?.plannedAt, '2026-04-20T12:00:00.000Z');
	});

	it('should generate monthly windows only on configured month days', () => {
		const schedule = Effect.runSync(
			validateSchedule({
			key: 'schedule-0',
			name: 'Monthly Window',
			periodicity: 'monthly',
			windowStart: '08:00',
			windowEnd: '08:30',
			occurrences: 1,
			weekdays: [],
			monthDays: [15],
			minimumSpacingMinutes: 0,
			}),
		);

		const firstPoll = Effect.runSync(evaluateRandomizerSchedules(
			new Date('2026-04-14T09:00:00.000Z'),
			[schedule],
			createEmptyRandomizerState(),
			fixedRandom(0),
		));

		assert.equal(firstPoll.emitted.length, 0);

		const secondPoll = Effect.runSync(evaluateRandomizerSchedules(
			new Date('2026-04-15T08:00:00.000Z'),
			[schedule],
			firstPoll.state,
			fixedRandom(0),
		));

		assert.equal(secondPoll.emitted.length, 1);
		assert.equal(secondPoll.emitted[0]?.plannedAt, '2026-04-15T08:00:00.000Z');
	});

	it('should preview the next applicable window in manual mode', () => {
		const schedule = Effect.runSync(
			validateSchedule({
			key: 'schedule-0',
			name: 'Preview Window',
			periodicity: 'daily',
			windowStart: '10:00',
			windowEnd: '10:10',
			occurrences: 2,
			weekdays: [],
			monthDays: [],
			minimumSpacingMinutes: 0,
			}),
		);

		const preview = Effect.runSync(previewRandomizerSchedules(
			new Date('2026-04-17T11:00:00.000Z'),
			[schedule],
			fixedRandom(0),
		));

		assert.equal(preview.length, 2);
		assert.deepEqual(
			preview.map((occurrence) => occurrence.plannedAt),
			['2026-04-18T10:00:00.000Z', '2026-04-18T10:01:00.000Z'],
		);
	});
});
