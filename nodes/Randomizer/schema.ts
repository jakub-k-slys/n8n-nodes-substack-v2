import * as Schema from 'effect/Schema';

export const RandomizerPeriodicitySchema = Schema.Literal('daily', 'weekly', 'monthly');

export const RandomizerScheduleParametersSchema = Schema.Struct({
	name: Schema.optional(Schema.String),
	periodicity: Schema.optional(RandomizerPeriodicitySchema),
	timezone: Schema.optional(Schema.String),
	occurrences: Schema.optional(Schema.Number),
	weekdays: Schema.optional(Schema.Array(Schema.String)),
	monthDays: Schema.optional(Schema.String),
	minimumSpacingMinutes: Schema.optional(Schema.Number),
});

export const RandomizerScheduleInputSchema = Schema.Struct({
	windowStartHour: Schema.optional(Schema.String),
	windowStartMinute: Schema.optional(Schema.String),
	windowEndHour: Schema.optional(Schema.String),
	windowEndMinute: Schema.optional(Schema.String),
	parameters: Schema.optional(RandomizerScheduleParametersSchema),
});

export const RandomizerScheduleCollectionSchema = Schema.Struct({
	schedule: Schema.optional(Schema.Array(RandomizerScheduleInputSchema)),
});

export const PendingOccurrenceSchema = Schema.Struct({
	occurrenceId: Schema.String,
	occurrenceIndex: Schema.Number,
	occurrencesInWindow: Schema.Number,
	plannedAt: Schema.String,
	scheduleKey: Schema.String,
	scheduleName: Schema.String,
	periodicity: RandomizerPeriodicitySchema,
	timezone: Schema.String,
	windowStart: Schema.String,
	windowEnd: Schema.String,
	windowDate: Schema.String,
});

export const PersistedScheduleStateSchema = Schema.Struct({
	fingerprint: Schema.String,
	lastGeneratedDate: Schema.String,
	pending: Schema.Array(PendingOccurrenceSchema),
});

export const RandomizerStateSchema = Schema.Struct({
	version: Schema.Literal(1),
	schedules: Schema.Record({
		key: Schema.String,
		value: PersistedScheduleStateSchema,
	}),
});

export type RandomizerScheduleInput = Schema.Schema.Type<typeof RandomizerScheduleInputSchema>;
export type RandomizerScheduleCollection = Schema.Schema.Type<
	typeof RandomizerScheduleCollectionSchema
>;
export type RandomizerStateInput = Schema.Schema.Type<typeof RandomizerStateSchema>;
