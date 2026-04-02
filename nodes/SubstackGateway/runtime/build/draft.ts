import { Match } from 'effect';

import type { DraftCommand } from '../../domain/command';
import type { GatewayHttpRequest } from '../../domain/http';
import type { GatewayUrl } from '../../schema';

export const buildDraftRequest = (
	gatewayUrl: GatewayUrl,
	command: DraftCommand,
): GatewayHttpRequest =>
	Match.value(command).pipe(
		Match.when({ _tag: 'List' }, () => ({
			method: 'GET',
			url: `${gatewayUrl}/drafts`,
			responseMode: 'items',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'Create' }, (command) => ({
			method: 'POST',
			url: `${gatewayUrl}/drafts`,
			body: { title: command.title, subtitle: command.subtitle, body: command.body },
			responseMode: 'single',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'Get' }, (command) => ({
			method: 'GET',
			url: `${gatewayUrl}/drafts/${command.draftId}`,
			responseMode: 'single',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'Update' }, (command) => ({
			method: 'PUT',
			url: `${gatewayUrl}/drafts/${command.draftId}`,
			body: { title: command.title, subtitle: command.subtitle, body: command.body },
			responseMode: 'single',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'Delete' }, (command) => ({
			method: 'DELETE',
			url: `${gatewayUrl}/drafts/${command.draftId}`,
			responseMode: 'empty',
			emptyResponseBody: { success: true, draftId: command.draftId },
		}) satisfies GatewayHttpRequest),
		Match.exhaustive,
	);
