import { Either, Match } from 'effect';
import type { PostCommand } from '../../domain/command';
import type { GatewayError } from '../../domain/error';
import type { GatewayResult } from '../../domain/result';
import { PostCommentsResponseSchema, PostGetResponseSchema } from '../../schema';
import { toGatewayComment, toGatewayPost } from './map';
import { decodeResponseSchema } from './shared';

export const decodePostResponse = (
	command: PostCommand,
	response: unknown,
): Either.Either<GatewayResult, GatewayError> =>
	Match.value(command).pipe(
		Match.when({ _tag: 'Get' }, () =>
			Either.map(decodeResponseSchema(PostGetResponseSchema, response), (item) => ({
				_tag: 'Post',
				result: { _tag: 'Fetched', item: toGatewayPost(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'GetComments' }, () =>
			Either.map(decodeResponseSchema(PostCommentsResponseSchema, response), ({ items }) => ({
				_tag: 'Post',
				result: { _tag: 'Comments', items: items.map(toGatewayComment) },
			}) satisfies GatewayResult),
		),
		Match.exhaustive,
	);
