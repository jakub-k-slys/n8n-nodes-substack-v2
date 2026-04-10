import { Either, Match } from 'effect';
import type { NoteCommand } from '../../../domain/command';
import type { GatewayError } from '../../../domain/error';
import type { GatewayResult } from '../../../domain/result';
import {
	NoteCreateResponseSchema,
	NoteDeleteResponseSchema,
	NoteGetResponseSchema,
	NoteLikeResponseSchema,
} from '../../../schema';
import { toCreatedNote, toDeletedNote, toGatewayNote, toLikedNote } from '../../decode-response/map';
import { decodeResponseSchema } from '../../decode-response/shared';

export const decodeNoteResponse = (
	command: NoteCommand,
	response: unknown,
): Either.Either<GatewayResult, GatewayError> =>
	Match.value(command).pipe(
		Match.when({ _tag: 'Create' }, () =>
			Either.map(decodeResponseSchema(NoteCreateResponseSchema, response), (item) => ({
				_tag: 'Note',
				result: { _tag: 'Created', item: toCreatedNote(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'Get' }, () =>
			Either.map(decodeResponseSchema(NoteGetResponseSchema, response), (item) => ({
				_tag: 'Note',
				result: { _tag: 'Fetched', item: toGatewayNote(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'Delete' }, () =>
			Either.map(decodeResponseSchema(NoteDeleteResponseSchema, response), (item) => ({
				_tag: 'Note',
				result: { _tag: 'Deleted', item: toDeletedNote(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'Like' }, () =>
			Either.map(decodeResponseSchema(NoteLikeResponseSchema, response), (item) => ({
				_tag: 'Note',
				result: { _tag: 'Liked', item: toLikedNote(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'Unlike' }, () =>
			Either.map(decodeResponseSchema(NoteLikeResponseSchema, response), (item) => ({
				_tag: 'Note',
				result: { _tag: 'Unliked', item: toLikedNote(item) },
			}) satisfies GatewayResult),
		),
		Match.exhaustive,
	);
