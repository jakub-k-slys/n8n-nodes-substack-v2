import { Either, Match } from 'effect';

import type { GatewayError } from '../domain/error';
import type { GatewayOperation, GatewayResource } from '../domain/operation';

const unsupported = (resource: string, operation: string): GatewayError =>
	({
		_tag: 'UnsupportedOperation',
		resource,
		operation,
	}) satisfies GatewayError;

export const decodeGatewayOperation = (
	resource: GatewayResource,
	operation: string,
): Either.Either<GatewayOperation, GatewayError> =>
	Match.value(resource).pipe(
		Match.when('ownPublication', () =>
			Match.value(operation).pipe(
				Match.when('ownProfile', () =>
					Either.right({ _tag: 'OwnPublication', operation: 'ownProfile' } as const),
				),
				Match.when('ownNotes', () =>
					Either.right({ _tag: 'OwnPublication', operation: 'ownNotes' } as const),
				),
				Match.when('ownPosts', () =>
					Either.right({ _tag: 'OwnPublication', operation: 'ownPosts' } as const),
				),
				Match.when('ownFollowing', () =>
					Either.right({ _tag: 'OwnPublication', operation: 'ownFollowing' } as const),
				),
				Match.orElse(() => Either.left(unsupported(resource, operation))),
			),
		),
		Match.when('note', () =>
			Match.value(operation).pipe(
				Match.when('createNote', () =>
					Either.right({ _tag: 'Note', operation: 'createNote' } as const),
				),
				Match.when('getNote', () => Either.right({ _tag: 'Note', operation: 'getNote' } as const)),
				Match.when('deleteNote', () =>
					Either.right({ _tag: 'Note', operation: 'deleteNote' } as const),
				),
				Match.orElse(() => Either.left(unsupported(resource, operation))),
			),
		),
		Match.when('draft', () =>
			Match.value(operation).pipe(
				Match.when('listDrafts', () =>
					Either.right({ _tag: 'Draft', operation: 'listDrafts' } as const),
				),
				Match.when('createDraft', () =>
					Either.right({ _tag: 'Draft', operation: 'createDraft' } as const),
				),
				Match.when('getDraft', () =>
					Either.right({ _tag: 'Draft', operation: 'getDraft' } as const),
				),
				Match.when('updateDraft', () =>
					Either.right({ _tag: 'Draft', operation: 'updateDraft' } as const),
				),
				Match.when('deleteDraft', () =>
					Either.right({ _tag: 'Draft', operation: 'deleteDraft' } as const),
				),
				Match.orElse(() => Either.left(unsupported(resource, operation))),
			),
		),
		Match.when('post', () =>
			Match.value(operation).pipe(
				Match.when('getPost', () => Either.right({ _tag: 'Post', operation: 'getPost' } as const)),
				Match.when('getPostComments', () =>
					Either.right({ _tag: 'Post', operation: 'getPostComments' } as const),
				),
				Match.orElse(() => Either.left(unsupported(resource, operation))),
			),
		),
		Match.when('profile', () =>
			Match.value(operation).pipe(
				Match.when('getProfile', () =>
					Either.right({ _tag: 'Profile', operation: 'getProfile' } as const),
				),
				Match.when('getProfileNotes', () =>
					Either.right({ _tag: 'Profile', operation: 'getProfileNotes' } as const),
				),
				Match.when('getProfilePosts', () =>
					Either.right({ _tag: 'Profile', operation: 'getProfilePosts' } as const),
				),
				Match.orElse(() => Either.left(unsupported(resource, operation))),
			),
		),
		Match.exhaustive,
	);
