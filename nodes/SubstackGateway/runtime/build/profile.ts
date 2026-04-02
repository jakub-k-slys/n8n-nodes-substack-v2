import { Match } from 'effect';

import type { ProfileCommand } from '../../domain/command';
import type { GatewayHttpRequest } from '../../domain/http';
import type { GatewayUrl } from '../../schema';

export const buildProfileRequest = (
	gatewayUrl: GatewayUrl,
	command: ProfileCommand,
): GatewayHttpRequest =>
	Match.value(command).pipe(
		Match.when({ _tag: 'Get' }, (command) => ({
			method: 'GET',
			url: `${gatewayUrl}/profiles/${command.profileSlug}`,
			responseMode: 'single',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'GetNotes' }, (command) => ({
			method: 'GET',
			url: `${gatewayUrl}/profiles/${command.profileSlug}/notes`,
			qs: command.cursor === undefined ? undefined : { cursor: command.cursor },
			responseMode: 'items',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'GetPosts' }, (command) => ({
			method: 'GET',
			url: `${gatewayUrl}/profiles/${command.profileSlug}/posts`,
			qs: { limit: command.limit, offset: command.offset },
			responseMode: 'items',
		}) satisfies GatewayHttpRequest),
		Match.exhaustive,
	);
