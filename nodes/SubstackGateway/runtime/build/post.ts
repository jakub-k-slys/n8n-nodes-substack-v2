import { Match } from 'effect';

import type { PostCommand } from '../../domain/command';
import type { GatewayHttpRequest } from '../../domain/http';
import type { GatewayUrl } from '../../schema';

export const buildPostRequest = (
	gatewayUrl: GatewayUrl,
	command: PostCommand,
): GatewayHttpRequest =>
	Match.value(command).pipe(
		Match.when({ _tag: 'Get' }, (command) => ({
			method: 'GET',
			url: `${gatewayUrl}/posts/${command.postId}`,
			responseMode: 'single',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'GetComments' }, (command) => ({
			method: 'GET',
			url: `${gatewayUrl}/posts/${command.postId}/comments`,
			responseMode: 'items',
		}) satisfies GatewayHttpRequest),
		Match.exhaustive,
	);
