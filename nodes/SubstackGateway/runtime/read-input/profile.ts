import { Effect, Match } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { GatewayError } from '../../domain/error';
import type { ProfileInput } from '../../domain/input';
import type { GatewayOperation } from '../../domain/operation';
import { getOptionalString } from '../params';
import { unexpectedError } from './shared';

export const readProfileInput = (
	context: IExecuteFunctions,
	itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'Profile' }>,
): Effect.Effect<ProfileInput, GatewayError> =>
	Effect.try({
		try: () =>
			Match.value(operation.operation).pipe(
				Match.when('getProfile', () => ({
					_tag: 'getProfile' as const,
					profileSlug: context.getNodeParameter('profileSlug', itemIndex),
				})),
				Match.when('getProfileNotes', () => ({
					_tag: 'getProfileNotes' as const,
					profileSlug: context.getNodeParameter('profileSlug', itemIndex),
					cursor: getOptionalString(context, 'cursor', itemIndex),
				})),
				Match.when('getProfilePosts', () => ({
					_tag: 'getProfilePosts' as const,
					profileSlug: context.getNodeParameter('profileSlug', itemIndex),
					limit: context.getNodeParameter('limit', itemIndex),
					offset: context.getNodeParameter('offset', itemIndex),
				})),
				Match.exhaustive,
			),
		catch: unexpectedError,
	});
