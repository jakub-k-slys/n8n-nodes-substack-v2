import type {
	INodeType,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { Effect } from 'effect';

import {
	defaultMonthDays,
	defaultWeekdays,
	evaluateRandomizerSchedules,
	previewRandomizerSchedules,
	readRandomizerState,
	sanitizeMonthDays,
	sanitizeWeekdays,
	type RandomizerError,
	type RandomizerPeriodicity,
	type RandomizerSchedule,
	type EmittedOccurrence,
	validateSchedule,
} from '../shared/randomizer';

type RandomizerScheduleInput = {
	readonly name?: string;
	readonly windowStartHour?: string;
	readonly windowStartMinute?: string;
	readonly windowEndHour?: string;
	readonly windowEndMinute?: string;
	readonly parameters?: {
		readonly periodicity?: RandomizerPeriodicity;
		readonly occurrences?: number;
		readonly weekdays?: unknown;
		readonly monthDays?: string;
		readonly minimumSpacingMinutes?: number;
	};
};

type RandomizerScheduleCollection = {
	readonly schedule?: RandomizerScheduleInput[];
};

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
		description: 'Fire random UTC trigger events inside configured schedule windows',
		defaults: {
			name: 'Randomizer',
		},
		eventTriggerDescription: 'Runs when one or more generated UTC random times become due',
		activationMessage:
			'Your randomizer trigger will now create random UTC fire times based on the schedules you defined.',
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
							name: 'Morning Burst',
							windowStartHour: '10',
							windowStartMinute: '00',
							windowEndHour: '13',
							windowEndMinute: '17',
							parameters: {
								periodicity: 'daily',
								occurrences: 3,
								weekdays: [...defaultWeekdays],
								monthDays: defaultMonthDays.join(','),
								minimumSpacingMinutes: 0,
							},
						},
					],
				},
				options: [
					{
						name: 'schedule',
						displayName: 'Schedule',
						values: [
							{
								displayName: '1. Window Start Hour (UTC)',
								name: 'windowStartHour',
								type: 'options',
								required: true,
								default: '10',
								options: HOUR_OPTIONS,
								description: 'UTC hour when the random window starts',
							},
							{
								displayName: '1. Window Start Minute (UTC)',
								name: 'windowStartMinute',
								type: 'options',
								required: true,
								default: '00',
								options: MINUTE_OPTIONS,
								description: 'UTC minute when the random window starts',
							},
							{
								displayName: '2. Window End Hour (UTC)',
								name: 'windowEndHour',
								type: 'options',
								required: true,
								default: '13',
								options: HOUR_OPTIONS,
								description: 'UTC hour when the random window ends',
							},
							{
								displayName: '2. Window End Minute (UTC)',
								name: 'windowEndMinute',
								type: 'options',
								required: true,
								default: '17',
								options: MINUTE_OPTIONS,
								description: 'UTC minute when the random window ends',
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
											'Minimum number of minutes between random trigger fires in the same UTC window',
									},
									{
										displayName: 'Month Days (UTC)',
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
										description: 'How often to create a fresh random UTC schedule window',
									},
									{
										displayName: 'Times Per Window',
										name: 'occurrences',
										type: 'number',
										typeOptions: {
											minValue: 1,
										},
										default: 3,
										description:
											'How many random trigger fires to create inside each matching window',
									},
									{
										displayName: 'Weekdays (UTC)',
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
										description: 'Weekdays to use when Periodicity is Weekly',
									},
								],
							},
							{
								displayName: 'Schedule Name',
								name: 'name',
								type: 'string',
								required: true,
								default: 'Morning Burst',
								description: 'Friendly label included in emitted items',
							},
						],
					},
				],
				description:
					'Create one or more UTC schedules. Manual execution previews only the next planned random fire time instead of waiting for it.',
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
			void Effect.runPromise(
				Effect.tap(
					evaluateRandomizerSchedules(
						new Date(),
						schedules,
						readRandomizerState(pollState.randomizer),
					),
					(evaluation) =>
						Effect.sync(() => {
							pollState.randomizer = evaluation.state as unknown as JsonObject;
							emitOccurrences(evaluation.emitted);
						}),
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
			const nextPreviewOccurrence = await runRandomizerEffect(
				this,
				Effect.map(previewRandomizerSchedules(new Date(), schedules), (occurrences) =>
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
			);

			if (nextPreviewOccurrence !== undefined) {
				this.emit([
					[
						{
							json: {
								...nextPreviewOccurrence,
								preview: true,
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
	const input = context.getNodeParameter('schedules') as RandomizerScheduleCollection;
	const schedules = input.schedule ?? [];

	if (schedules.length === 0) {
		return Effect.fail({
			_tag: 'RandomizerError',
			message: 'At least one schedule is required',
		});
	}

	return Effect.forEach(schedules, (schedule, index) =>
		Effect.flatMap(
			sanitizeMonthDays(String(schedule.parameters?.monthDays ?? '')),
			(monthDays) =>
				validateSchedule({
					key: `schedule-${index}`,
					name: String(schedule.name ?? '').trim(),
					periodicity: schedule.parameters?.periodicity ?? 'daily',
					windowStart: toUtcTimeString(schedule.windowStartHour, schedule.windowStartMinute),
					windowEnd: toUtcTimeString(schedule.windowEndHour, schedule.windowEndMinute),
					occurrences: Number(schedule.parameters?.occurrences ?? 3),
					weekdays: sanitizeWeekdays(schedule.parameters?.weekdays),
					monthDays,
					minimumSpacingMinutes: Number(schedule.parameters?.minimumSpacingMinutes ?? 0),
				}),
		),
	);
};

const toUtcTimeString = (hour: string | undefined, minute: string | undefined): string =>
	`${String(hour ?? '').padStart(2, '0')}:${String(minute ?? '').padStart(2, '0')}`;

const runRandomizerEffect = <A>(
	context: ITriggerFunctions,
	effect: Effect.Effect<A, RandomizerError>,
): Promise<A> =>
	Effect.runPromise(effect).catch((error: RandomizerError) => {
		throw new NodeOperationError(context.getNode(), error.message);
	});
