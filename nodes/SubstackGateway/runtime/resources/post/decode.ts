import { Either, Match } from 'effect';

import type { PostCommand } from '../../../domain/command';
import type { GatewayError } from '../../../domain/error';
import type { PostInput } from '../../../domain/input';
import { PostIdInputSchema } from '../../../schema';
import { decodeInput } from '../../decode/shared';

export const decodePostCommand = (
	input: PostInput,
): Either.Either<PostCommand, GatewayError> =>
	Match.value(input).pipe(
		Match.when({ _tag: 'getPost' }, ({ postId }) =>
			Either.map(
				decodeInput(PostIdInputSchema, {
					postId,
				}),
				(input) => ({ _tag: 'Get', ...input }) as const,
			),
		),
		Match.when({ _tag: 'getPostComments' }, ({ postId }) =>
			Either.map(
				decodeInput(PostIdInputSchema, {
					postId,
				}),
				(input) => ({ _tag: 'GetComments', ...input }) as const,
			),
		),
		Match.when({ _tag: 'likePost' }, ({ postId }) =>
			Either.map(
				decodeInput(PostIdInputSchema, {
					postId,
				}),
				(input) => ({ _tag: 'Like', ...input }) as const,
			),
		),
		Match.when({ _tag: 'unlikePost' }, ({ postId }) =>
			Either.map(
				decodeInput(PostIdInputSchema, {
					postId,
				}),
				(input) => ({ _tag: 'Unlike', ...input }) as const,
			),
		),
		Match.exhaustive,
	);
