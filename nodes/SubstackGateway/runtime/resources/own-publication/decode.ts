import { Match } from 'effect';
import type { OwnPublicationCommand } from '../../../domain/command';
import type { OwnPublicationInput } from '../../../domain/input';
import type { OwnPublicationOperation } from '../../../domain/operation';

export const decodeOwnPublicationCommand = (
	input: OwnPublicationInput | OwnPublicationOperation,
): OwnPublicationCommand =>
	Match.value(typeof input === 'string' ? input : input._tag).pipe(
		Match.when('ownProfile', () => ({ _tag: 'OwnProfile' } as const)),
		Match.when('ownNotes', () => ({ _tag: 'OwnNotes' } as const)),
		Match.when('ownPosts', () => ({ _tag: 'OwnPosts' } as const)),
		Match.when('ownFollowing', () => ({ _tag: 'OwnFollowing' } as const)),
		Match.exhaustive,
	);
