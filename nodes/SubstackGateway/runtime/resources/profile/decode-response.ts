import { Either, Match } from 'effect';
import type { GatewayResult } from '../../../domain/result';
import type { GatewayError } from '../../../domain/error';
import type { ProfileCommand } from '../../../domain/command';
import {
	ProfileGetResponseSchema,
	ProfileNotesResponseSchema,
	ProfilePostsResponseSchema,
} from '../../../schema';
import { toGatewayNote, toGatewayPostSummary, toGatewayProfile } from '../../decode-response/map';
import { decodeResponseSchema } from '../../decode-response/shared';

export const decodeProfileResponse = (
	command: ProfileCommand,
	response: unknown,
): Either.Either<GatewayResult, GatewayError> =>
	Match.value(command).pipe(
		Match.when({ _tag: 'Get' }, () =>
			Either.map(decodeResponseSchema(ProfileGetResponseSchema, response), (item) => ({
				_tag: 'Profile',
				result: { _tag: 'Fetched', item: toGatewayProfile(item) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'GetNotes' }, () =>
			Either.map(decodeResponseSchema(ProfileNotesResponseSchema, response), ({ items }) => ({
				_tag: 'Profile',
				result: { _tag: 'Notes', items: items.map(toGatewayNote) },
			}) satisfies GatewayResult),
		),
		Match.when({ _tag: 'GetPosts' }, () =>
			Either.map(decodeResponseSchema(ProfilePostsResponseSchema, response), ({ items }) => ({
				_tag: 'Profile',
				result: { _tag: 'Posts', items: items.map(toGatewayPostSummary) },
			}) satisfies GatewayResult),
		),
		Match.exhaustive,
	);
