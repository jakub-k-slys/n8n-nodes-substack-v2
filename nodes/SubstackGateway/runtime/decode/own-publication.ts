import { Match } from 'effect';
import type { OwnPublicationCommand } from '../../domain/command';
import type { OwnPublicationOperation } from '../../domain/operation';

export const decodeOwnPublicationCommand = (
	operation: OwnPublicationOperation,
): OwnPublicationCommand =>
	Match.value(operation).pipe(
		Match.when('ownProfile', () => ({ _tag: 'OwnProfile' } as const)),
		Match.when('ownNotes', () => ({ _tag: 'OwnNotes' } as const)),
		Match.when('ownPosts', () => ({ _tag: 'OwnPosts' } as const)),
		Match.when('ownFollowing', () => ({ _tag: 'OwnFollowing' } as const)),
		Match.exhaustive,
	);
