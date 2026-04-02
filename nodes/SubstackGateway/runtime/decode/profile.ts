import { Either, Match } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { ProfileCommand } from '../../domain/command';
import type { GatewayError } from '../../domain/error';
import type { ProfileOperation } from '../../domain/operation';
import {
	ProfileNotesInputSchema,
	ProfilePostsInputSchema,
	ProfileSlugInputSchema,
} from '../../schema';
import { getOptionalString } from '../params';
import { decodeInput } from './shared';

export const decodeProfileCommand = (
	context: IExecuteFunctions,
	itemIndex: number,
	operation: ProfileOperation,
): Either.Either<ProfileCommand, GatewayError> =>
	Match.value(operation).pipe(
		Match.when('getProfile', () =>
			Either.map(
				decodeInput(ProfileSlugInputSchema, {
					profileSlug: context.getNodeParameter('profileSlug', itemIndex),
				}),
				(input) => ({ _tag: 'Get', ...input }) as const,
			),
		),
		Match.when('getProfileNotes', () =>
			Either.map(
				decodeInput(ProfileNotesInputSchema, {
					profileSlug: context.getNodeParameter('profileSlug', itemIndex),
					cursor: getOptionalString(context, 'cursor', itemIndex),
				}),
				(input) => ({ _tag: 'GetNotes', ...input }) as const,
			),
		),
		Match.when('getProfilePosts', () =>
			Either.map(
				decodeInput(ProfilePostsInputSchema, {
					profileSlug: context.getNodeParameter('profileSlug', itemIndex),
					limit: context.getNodeParameter('limit', itemIndex),
					offset: context.getNodeParameter('offset', itemIndex),
				}),
				(input) => ({ _tag: 'GetPosts', ...input }) as const,
			),
		),
		Match.exhaustive,
	);
