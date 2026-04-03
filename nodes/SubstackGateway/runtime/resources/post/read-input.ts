import { Effect, Match } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { GatewayError } from '../../../domain/error';
import type { PostInput } from '../../../domain/input';
import type { GatewayOperation } from '../../../domain/operation';
import { unexpectedError } from '../../live/read-input-shared';

export const readPostInput = (
	context: IExecuteFunctions,
	itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'Post' }>,
): Effect.Effect<PostInput, GatewayError> =>
	Effect.try({
		try: () =>
			Match.value(operation.operation).pipe(
				Match.when('getPost', () => ({
					_tag: 'getPost' as const,
					postId: context.getNodeParameter('postId', itemIndex),
				})),
				Match.when('getPostComments', () => ({
					_tag: 'getPostComments' as const,
					postId: context.getNodeParameter('postId', itemIndex),
				})),
				Match.exhaustive,
			),
		catch: unexpectedError,
	});
