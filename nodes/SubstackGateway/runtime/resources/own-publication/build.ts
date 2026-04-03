import { Match } from 'effect';

import type { OwnPublicationCommand } from '../../../domain/command';
import type { GatewayHttpRequest } from '../../../domain/http';
import type { GatewayUrl } from '../../../schema';

export const buildOwnPublicationRequest = (
	gatewayUrl: GatewayUrl,
	command: OwnPublicationCommand,
): GatewayHttpRequest =>
	Match.value(command).pipe(
		Match.when({ _tag: 'OwnProfile' }, () => ({
			method: 'GET',
			url: `${gatewayUrl}/me`,
			responseMode: 'single',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'OwnNotes' }, () => ({
			method: 'GET',
			url: `${gatewayUrl}/me/notes`,
			responseMode: 'items',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'OwnPosts' }, () => ({
			method: 'GET',
			url: `${gatewayUrl}/me/posts`,
			responseMode: 'items',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'OwnFollowing' }, () => ({
			method: 'GET',
			url: `${gatewayUrl}/me/following`,
			responseMode: 'items',
		}) satisfies GatewayHttpRequest),
		Match.exhaustive,
	);
