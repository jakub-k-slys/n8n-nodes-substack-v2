import { Either, Match } from 'effect';
import type { PostCommand } from '../../../domain/command';
import type { GatewayError } from '../../../domain/error';
import type { GatewayResult } from '../../../domain/result';
import { PostCommentsResponseSchema, PostGetResponseSchema, PostLikeResponseSchema } from '../../../schema';
import { toGatewayComment, toGatewayPost, toLikedPost } from '../../decode-response/map';
import { decodeResponseSchema } from '../../decode-response/shared';

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
		Match.when({ _tag: 'Like' }, () =>
			Either.map(decodeResponseSchema(PostLikeResponseSchema, response), (item) => ({
				_tag: 'Post',
				result: { _tag: 'Liked', item: toLikedPost(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'Unlike' }, () =>
			Either.map(decodeResponseSchema(PostLikeResponseSchema, response), (item) => ({
				_tag: 'Post',
				result: { _tag: 'Unliked', item: toLikedPost(item) },
			}) satisfies GatewayResult),
		),
		Match.exhaustive,
	);
