import { Either, Match } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { NoteCommand } from '../../domain/command';
import type { GatewayError } from '../../domain/error';
import type { NoteOperation } from '../../domain/operation';
import { CreateNoteInputSchema, NoteIdInputSchema } from '../../schema';
import { getOptionalString } from '../params';
import { decodeInput } from './shared';

export const decodeNoteCommand = (
	context: IExecuteFunctions,
	itemIndex: number,
	operation: NoteOperation,
): Either.Either<NoteCommand, GatewayError> =>
	Match.value(operation).pipe(
		Match.when('createNote', () =>
			Either.map(
				decodeInput(CreateNoteInputSchema, {
					content: context.getNodeParameter('content', itemIndex),
					attachment: getOptionalString(context, 'attachment', itemIndex),
				}),
				(input) => ({ _tag: 'Create', ...input }) as const,
			),
		),
		Match.when('getNote', () =>
			Either.map(
				decodeInput(NoteIdInputSchema, {
					noteId: context.getNodeParameter('noteId', itemIndex),
				}),
				(input) => ({ _tag: 'Get', ...input }) as const,
			),
		),
		Match.when('deleteNote', () =>
			Either.map(
				decodeInput(NoteIdInputSchema, {
					noteId: context.getNodeParameter('noteId', itemIndex),
				}),
				(input) => ({ _tag: 'Delete', ...input }) as const,
			),
		),
		Match.exhaustive,
	);
