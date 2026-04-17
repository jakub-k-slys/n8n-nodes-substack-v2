import * as Schema from 'effect/Schema';

export const RandomizerPeriodicitySchema = Schema.Literal('daily', 'weekly', 'monthly');

export const RandomizerScheduleParametersSchema = Schema.Struct({
	periodicity: Schema.optional(RandomizerPeriodicitySchema),
	occurrences: Schema.optional(Schema.Number),
	weekdays: Schema.optional(Schema.Array(Schema.String)),
	monthDays: Schema.optional(Schema.String),
	minimumSpacingMinutes: Schema.optional(Schema.Number),
});

export const RandomizerScheduleInputSchema = Schema.Struct({
	name: Schema.optional(Schema.String),
	windowStartHour: Schema.optional(Schema.String),
	windowStartMinute: Schema.optional(Schema.String),
	windowEndHour: Schema.optional(Schema.String),
	windowEndMinute: Schema.optional(Schema.String),
	parameters: Schema.optional(RandomizerScheduleParametersSchema),
});

export const RandomizerScheduleCollectionSchema = Schema.Struct({
	schedule: Schema.optional(Schema.Array(RandomizerScheduleInputSchema)),
});

export type RandomizerScheduleInput = Schema.Schema.Type<typeof RandomizerScheduleInputSchema>;
export type RandomizerScheduleCollection = Schema.Schema.Type<
	typeof RandomizerScheduleCollectionSchema
>;
