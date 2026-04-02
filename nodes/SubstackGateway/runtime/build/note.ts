import { Match } from 'effect';

import type { NoteCommand } from '../../domain/command';
import type { GatewayHttpRequest } from '../../domain/http';
import type { GatewayUrl } from '../../schema';

export const buildNoteRequest = (
	gatewayUrl: GatewayUrl,
	command: NoteCommand,
): GatewayHttpRequest =>
	Match.value(command).pipe(
		Match.when({ _tag: 'Create' }, (command) => ({
			method: 'POST',
			url: `${gatewayUrl}/notes`,
			body: {
				content: command.content,
				...(command.attachment !== undefined ? { attachment: command.attachment } : {}),
			},
			responseMode: 'single',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'Get' }, (command) => ({
			method: 'GET',
			url: `${gatewayUrl}/notes/${command.noteId}`,
			responseMode: 'single',
		}) satisfies GatewayHttpRequest),
		Match.when({ _tag: 'Delete' }, (command) => ({
			method: 'DELETE',
			url: `${gatewayUrl}/notes/${command.noteId}`,
			responseMode: 'empty',
			emptyResponseBody: { success: true, noteId: command.noteId },
		}) satisfies GatewayHttpRequest),
		Match.exhaustive,
	);
