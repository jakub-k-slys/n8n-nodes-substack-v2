import { Either, Match } from 'effect';

import type { ProfileCommand } from '../../../domain/command';
import type { GatewayError } from '../../../domain/error';
import type { ProfileInput } from '../../../domain/input';
import {
	ProfileNotesInputSchema,
	ProfilePostsInputSchema,
	ProfileSlugInputSchema,
} from '../../../schema';
import { decodeInput } from '../../decode/shared';

export const decodeProfileCommand = (
	input: ProfileInput,
): Either.Either<ProfileCommand, GatewayError> =>
	Match.value(input).pipe(
		Match.when({ _tag: 'getProfile' }, ({ profileSlug }) =>
			Either.map(
				decodeInput(ProfileSlugInputSchema, {
					profileSlug,
				}),
				(input) => ({ _tag: 'Get', ...input }) as const,
			),
		),
		Match.when({ _tag: 'getProfileNotes' }, ({ profileSlug, cursor }) =>
			Either.map(
				decodeInput(ProfileNotesInputSchema, {
					profileSlug,
					cursor,
				}),
				(input) => ({ _tag: 'GetNotes', ...input }) as const,
			),
		),
		Match.when({ _tag: 'getProfilePosts' }, ({ profileSlug, limit, offset }) =>
			Either.map(
				decodeInput(ProfilePostsInputSchema, {
					profileSlug,
					limit,
					offset,
				}),
				(input) => ({ _tag: 'GetPosts', ...input }) as const,
			),
		),
		Match.exhaustive,
	);
