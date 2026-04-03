import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { executeNoteOperation } from '../dist/nodes/SubstackGateway/runtime/resources/note/execute.js';

type TestContext = {
	getNodeParameter: (name: string, itemIndex?: number, fallback?: unknown) => unknown;
};

const createContext = (parameters: Record<string, unknown>): TestContext => ({
	getNodeParameter: (name, _itemIndex, fallback) => (name in parameters ? parameters[name] : fallback),
});

describe('executeNoteOperation', () => {
	it('should execute a note-local pipeline', async () => {
		let capturedUrl: string | undefined;

		const result = await Effect.runPromise(
			Effect.provideService(
				executeNoteOperation(
					createContext({
						content: 'hello world',
						attachment: 'https://example.com/a.png',
					}) as never,
					0,
					'http://localhost:5001/api/v1' as never,
					'createNote',
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
		assert.deepEqual(result, [
			{
				json: {
					id: 1,
				},
				pairedItem: { item: 0 },
			},
		]);
	});
});
