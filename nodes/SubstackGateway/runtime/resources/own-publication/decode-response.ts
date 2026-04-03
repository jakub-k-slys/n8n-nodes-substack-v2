import { Either, Match } from 'effect';
import type { OwnPublicationCommand } from '../../../domain/command';
import type { GatewayError } from '../../../domain/error';
import type { GatewayResult } from '../../../domain/result';
import {
	OwnFollowingResponseSchema,
	OwnNotesResponseSchema,
	OwnPostsResponseSchema,
	OwnProfileResponseSchema,
} from '../../../schema';
import {
	toGatewayFollowingUser,
	toGatewayNote,
	toGatewayPostSummary,
	toGatewayProfile,
} from '../../decode-response/map';
import { decodeResponseSchema } from '../../decode-response/shared';

export const decodeOwnPublicationResponse = (
	command: OwnPublicationCommand,
	response: unknown,
): Either.Either<GatewayResult, GatewayError> =>
	Match.value(command).pipe(
		Match.when({ _tag: 'OwnProfile' }, () =>
			Either.map(decodeResponseSchema(OwnProfileResponseSchema, response), (item) => ({
				_tag: 'OwnPublication',
				result: { _tag: 'Profile', item: toGatewayProfile(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'OwnNotes' }, () =>
			Either.map(decodeResponseSchema(OwnNotesResponseSchema, response), ({ items }) => ({
				_tag: 'OwnPublication',
				result: { _tag: 'Notes', items: items.map(toGatewayNote) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'OwnPosts' }, () =>
			Either.map(decodeResponseSchema(OwnPostsResponseSchema, response), ({ items }) => ({
				_tag: 'OwnPublication',
				result: { _tag: 'Posts', items: items.map(toGatewayPostSummary) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'OwnFollowing' }, () =>
			Either.map(decodeResponseSchema(OwnFollowingResponseSchema, response), ({ items }) => ({
				_tag: 'OwnPublication',
				result: { _tag: 'Following', items: items.map(toGatewayFollowingUser) },
			}) satisfies GatewayResult),
		),
		Match.exhaustive,
	);
