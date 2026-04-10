import { Match } from 'effect';

import type { PostCommand } from '../../../domain/command';
import type { GatewayHttpRequest } from '../../../domain/http';
import type { GatewayUrl } from '../../../schema';

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
		Match.when({ _tag: 'Like' }, (command) => ({
			method: 'PUT',
			url: `${gatewayUrl}/posts/${command.postId}/like`,
			responseMode: 'empty',
			emptyResponseBody: { success: true, postId: command.postId, liked: true },
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'Unlike' }, (command) => ({
			method: 'DELETE',
			url: `${gatewayUrl}/posts/${command.postId}/like`,
			responseMode: 'empty',
			emptyResponseBody: { success: true, postId: command.postId, liked: false },
		}) satisfies GatewayHttpRequest),
		Match.exhaustive,
	);
