import { Either, Match } from 'effect';

import type { DraftCommand } from '../../../domain/command';
import type { GatewayError } from '../../../domain/error';
import type { DraftInput } from '../../../domain/input';
import {
	DraftFieldsInputSchema,
	DraftIdInputSchema,
	DraftWithIdInputSchema,
} from '../../../schema';
import { decodeInput } from '../../decode/shared';

export const decodeDraftCommand = (
	input: DraftInput,
): Either.Either<DraftCommand, GatewayError> =>
	Match.value(input).pipe(
		Match.when({ _tag: 'listDrafts' }, () => Either.right({ _tag: 'List' } as const)),
		Match.when({ _tag: 'createDraft' }, ({ title, subtitle, body }) =>
			Either.map(
				decodeInput(DraftFieldsInputSchema, { title, subtitle, body }),
				(input) => ({ _tag: 'Create', ...input }) as const,
			),
		),
		Match.when({ _tag: 'getDraft' }, ({ draftId }) =>
			Either.map(
				decodeInput(DraftIdInputSchema, {
					draftId,
				}),
				(input) => ({ _tag: 'Get', ...input }) as const,
			),
		),
		Match.when({ _tag: 'updateDraft' }, ({ draftId, title, subtitle, body }) =>
			Either.map(
				decodeInput(DraftWithIdInputSchema, {
					draftId,
					title,
					subtitle,
					body,
				}),
				(input) => ({ _tag: 'Update', ...input }) as const,
			),
		),
		Match.when({ _tag: 'deleteDraft' }, ({ draftId }) =>
			Either.map(
				decodeInput(DraftIdInputSchema, {
					draftId,
				}),
				(input) => ({ _tag: 'Delete', ...input }) as const,
			),
		),
		Match.exhaustive,
	);
