import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { NodeInput } from '../dist/nodes/SubstackGateway/runtime/node-input.js';
import { executeNoteOperation } from '../dist/nodes/SubstackGateway/runtime/resources/note/index.js';

describe('executeNoteOperation', () => {
	it('should execute a note-local pipeline', async () => {
		let capturedUrl: string | undefined;

		const result = await Effect.runPromise(
			Effect.provideService(
				Effect.provideService(
					executeNoteOperation(0, 'http://localhost:5001/api/v1' as never, 'createNote'),
					NodeInput,
					{
						getSelection: Effect.die('selection is not used in the note executor test'),
						getOwnPublicationInput: () =>
							Effect.die('own publication input is not used in the note executor test'),
						getNoteInput: () =>
							Effect.succeed({
								_tag: 'createNote',
								content: 'hello world',
								attachment: 'https://example.com/a.png',
							}),
						getDraftInput: () => Effect.die('draft input is not used in the note executor test'),
						getPostInput: () => Effect.die('post input is not used in the note executor test'),
						getProfileInput: () =>
							Effect.die('profile input is not used in the note executor test'),
					},
				),
				HttpClient.HttpClient,
				{
					...HttpClient.make(() =>
						Effect.die('execute should be overridden by the test service'),
					),
					execute: (request) => {
						capturedUrl = request.url;
						return Effect.succeed(
							ClientResponse.fromWeb(
								request,
								new Response(
									JSON.stringify({
										id: 1,
										body: 'hello world',
										likes_count: 0,
										attachment: 'https://example.com/a.png',
									}),
									{
										status: 200,
										headers: { 'content-type': 'application/json' },
									},
								),
							),
						);
					},
				},
			),
		);

		assert.equal(capturedUrl, 'http://localhost:5001/api/v1/notes');
		assert.deepEqual(result, {
			_tag: 'Note',
			result: {
				_tag: 'Created',
				item: {
					id: 1,
				},
			},
		});
	});
});
