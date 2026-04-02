import { Either, Match } from 'effect';
import type { DraftCommand } from '../../domain/command';
import type { GatewayError } from '../../domain/error';
import type { GatewayResult } from '../../domain/result';
import {
	DraftCreateResponseSchema,
	DraftDeleteResponseSchema,
	DraftGetResponseSchema,
	DraftListResponseSchema,
	DraftUpdateResponseSchema,
} from '../../schema';
import {
	toCreatedDraft,
	toDeletedDraft,
	toGatewayDraft,
	toGatewayDraftSummary,
} from './map';
import { decodeResponseSchema } from './shared';

export const decodeDraftResponse = (
	command: DraftCommand,
	response: unknown,
): Either.Either<GatewayResult, GatewayError> =>
	Match.value(command).pipe(
		Match.when({ _tag: 'List' }, () =>
			Either.map(decodeResponseSchema(DraftListResponseSchema, response), ({ items }) => ({
				_tag: 'Draft',
				result: { _tag: 'List', items: items.map(toGatewayDraftSummary) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'Create' }, () =>
			Either.map(decodeResponseSchema(DraftCreateResponseSchema, response), (item) => ({
				_tag: 'Draft',
				result: { _tag: 'Created', item: toCreatedDraft(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'Get' }, () =>
			Either.map(decodeResponseSchema(DraftGetResponseSchema, response), (item) => ({
				_tag: 'Draft',
				result: { _tag: 'Fetched', item: toGatewayDraft(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'Update' }, () =>
			Either.map(decodeResponseSchema(DraftUpdateResponseSchema, response), (item) => ({
				_tag: 'Draft',
				result: { _tag: 'Updated', item: toGatewayDraft(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'Delete' }, () =>
			Either.map(decodeResponseSchema(DraftDeleteResponseSchema, response), (item) => ({
				_tag: 'Draft',
				result: { _tag: 'Deleted', item: toDeletedDraft(item) },
			}) satisfies GatewayResult),
		),
		Match.exhaustive,
	);
