import { Effect, Match } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { GatewayError } from '../../../domain/error';
import type { DraftInput } from '../../../domain/input';
import type { GatewayOperation } from '../../../domain/operation';
import { getDraftPayload } from '../../params';
import { unexpectedError } from '../../read-input/shared';

export const readDraftInput = (
	context: IExecuteFunctions,
	itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'Draft' }>,
): Effect.Effect<DraftInput, GatewayError> =>
	Effect.try({
		try: () =>
			Match.value(operation.operation).pipe(
				Match.when('listDrafts', () => ({ _tag: 'listDrafts' as const })),
				Match.when('createDraft', () => ({
					_tag: 'createDraft' as const,
					...getDraftPayload(context, itemIndex),
				})),
				Match.when('getDraft', () => ({
					_tag: 'getDraft' as const,
					draftId: context.getNodeParameter('draftId', itemIndex),
				})),
				Match.when('updateDraft', () => ({
					_tag: 'updateDraft' as const,
					draftId: context.getNodeParameter('draftId', itemIndex),
					...getDraftPayload(context, itemIndex),
				})),
				Match.when('deleteDraft', () => ({
					_tag: 'deleteDraft' as const,
					draftId: context.getNodeParameter('draftId', itemIndex),
				})),
				Match.exhaustive,
			),
		catch: unexpectedError,
	});
