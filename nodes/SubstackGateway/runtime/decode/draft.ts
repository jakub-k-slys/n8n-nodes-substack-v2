import { Either, Match } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { DraftCommand } from '../../domain/command';
import type { GatewayError } from '../../domain/error';
import type { DraftOperation } from '../../domain/operation';
import { DraftFieldsInputSchema, DraftIdInputSchema, DraftWithIdInputSchema } from '../../schema';
import { getDraftPayload } from '../params';
import { decodeInput } from './shared';

export const decodeDraftCommand = (
	context: IExecuteFunctions,
	itemIndex: number,
	operation: DraftOperation,
): Either.Either<DraftCommand, GatewayError> =>
	Match.value(operation).pipe(
		Match.when('listDrafts', () => Either.right({ _tag: 'List' } as const)),
		Match.when('createDraft', () =>
			Either.map(
				decodeInput(DraftFieldsInputSchema, getDraftPayload(context, itemIndex)),
				(input) => ({ _tag: 'Create', ...input }) as const,
			),
		),
		Match.when('getDraft', () =>
			Either.map(
				decodeInput(DraftIdInputSchema, {
					draftId: context.getNodeParameter('draftId', itemIndex),
				}),
				(input) => ({ _tag: 'Get', ...input }) as const,
			),
		),
		Match.when('updateDraft', () =>
			Either.map(
				decodeInput(DraftWithIdInputSchema, {
					draftId: context.getNodeParameter('draftId', itemIndex),
					...getDraftPayload(context, itemIndex),
				}),
				(input) => ({ _tag: 'Update', ...input }) as const,
			),
		),
		Match.when('deleteDraft', () =>
			Either.map(
				decodeInput(DraftIdInputSchema, {
					draftId: context.getNodeParameter('draftId', itemIndex),
				}),
				(input) => ({ _tag: 'Delete', ...input }) as const,
			),
		),
		Match.exhaustive,
	);
