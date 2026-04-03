import { Either, Match } from 'effect';

import type { NoteCommand } from '../../../domain/command';
import type { GatewayError } from '../../../domain/error';
import type { NoteInput } from '../../../domain/input';
import { CreateNoteInputSchema, NoteIdInputSchema } from '../../../schema';
import { decodeInput } from '../../decode/shared';

export const decodeNoteCommand = (
	input: NoteInput,
): Either.Either<NoteCommand, GatewayError> =>
	Match.value(input).pipe(
		Match.when({ _tag: 'createNote' }, ({ content, attachment }) =>
			Either.map(
				decodeInput(CreateNoteInputSchema, {
					content,
					attachment,
				}),
				(input) => ({ _tag: 'Create', ...input }) as const,
			),
		),
		Match.when({ _tag: 'getNote' }, ({ noteId }) =>
			Either.map(
				decodeInput(NoteIdInputSchema, {
					noteId,
				}),
				(input) => ({ _tag: 'Get', ...input }) as const,
			),
		),
		Match.when({ _tag: 'deleteNote' }, ({ noteId }) =>
			Either.map(
				decodeInput(NoteIdInputSchema, {
					noteId,
				}),
				(input) => ({ _tag: 'Delete', ...input }) as const,
			),
		),
		Match.exhaustive,
	);
