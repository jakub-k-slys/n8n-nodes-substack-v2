import { Effect, Match } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { GatewayError } from '../../../domain/error';
import type { NoteInput } from '../../../domain/input';
import type { GatewayOperation } from '../../../domain/operation';
import { getOptionalString } from '../../params';
import { unexpectedError } from '../../read-input/shared';

export const readNoteInput = (
	context: IExecuteFunctions,
	itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'Note' }>,
): Effect.Effect<NoteInput, GatewayError> =>
	Effect.try({
		try: () =>
			Match.value(operation.operation).pipe(
				Match.when('createNote', () => ({
					_tag: 'createNote' as const,
					content: context.getNodeParameter('content', itemIndex),
					attachment: getOptionalString(context, 'attachment', itemIndex),
				})),
				Match.when('getNote', () => ({
					_tag: 'getNote' as const,
					noteId: context.getNodeParameter('noteId', itemIndex),
				})),
				Match.when('deleteNote', () => ({
					_tag: 'deleteNote' as const,
					noteId: context.getNodeParameter('noteId', itemIndex),
				})),
				Match.exhaustive,
			),
		catch: unexpectedError,
	});
