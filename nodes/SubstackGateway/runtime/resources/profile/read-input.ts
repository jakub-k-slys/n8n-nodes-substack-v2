import { Effect, Match } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { GatewayError } from '../../../domain/error';
import type { ProfileInput } from '../../../domain/input';
import type { GatewayOperation } from '../../../domain/operation';
import { getOptionalString } from '../../params';
import { unexpectedError } from '../../read-input/shared';

export const readProfileInput = (
	context: IExecuteFunctions,
	itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'Profile' }>,
): Effect.Effect<ProfileInput, GatewayError> =>
	Effect.try({
		try: () => {
			const profileSlug = context.getNodeParameter('profileSlug', itemIndex);
			const cursor = getOptionalString(context, 'cursor', itemIndex);

			return (
			Match.value(operation.operation).pipe(
				Match.when('getProfile', () => ({
					_tag: 'getProfile' as const,
					profileSlug,
				})),
				Match.when('getProfileNotes', () => ({
					_tag: 'getProfileNotes' as const,
					profileSlug,
					...(cursor === undefined ? {} : { cursor }),
				})),
				Match.when('getProfilePosts', () => ({
					_tag: 'getProfilePosts' as const,
					profileSlug,
					limit: context.getNodeParameter('limit', itemIndex),
					offset: context.getNodeParameter('offset', itemIndex),
				})),
				Match.exhaustive,
			)
			);
		},
		catch: unexpectedError,
	});
