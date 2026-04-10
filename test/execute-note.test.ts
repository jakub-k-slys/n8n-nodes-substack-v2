import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { NodeInput } from '../nodes/SubstackGateway/runtime/node-input.ts';
import { executeNoteOperation } from '../nodes/SubstackGateway/runtime/resources/note/index.ts';

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

	it('should execute a note like pipeline', async () => {
		let capturedUrl: string | undefined;
		let capturedMethod: string | undefined;

		const result = await Effect.runPromise(
			Effect.provideService(
				Effect.provideService(
					executeNoteOperation(0, 'http://localhost:5001/api/v1' as never, 'likeNote'),
					NodeInput,
					{
						getSelection: Effect.die('selection is not used in the note executor test'),
						getOwnPublicationInput: () =>
							Effect.die('own publication input is not used in the note executor test'),
						getNoteInput: () =>
							Effect.succeed({
								_tag: 'likeNote',
								noteId: 123,
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
						capturedMethod = request.method;
						return Effect.succeed(
							ClientResponse.fromWeb(request, new Response(null, { status: 204 })),
						);
					},
				},
			),
		);

		assert.equal(capturedMethod, 'PUT');
		assert.equal(capturedUrl, 'http://localhost:5001/api/v1/notes/123/like');
		assert.deepEqual(result, {
			_tag: 'Note',
			result: {
				_tag: 'Liked',
				item: {
					success: true,
					noteId: 123,
					liked: true,
				},
			},
		});
	});
});
