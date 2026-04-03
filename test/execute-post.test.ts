import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { NodeInput } from '../dist/nodes/SubstackGateway/runtime/node-input.js';
import { executePostOperation } from '../dist/nodes/SubstackGateway/runtime/resources/post/index.js';

describe('executePostOperation', () => {
	it('should execute a post-local pipeline', async () => {
		let capturedUrl: string | undefined;

		const result = await Effect.runPromise(
			Effect.provideService(
				Effect.provideService(
					executePostOperation(0, 'http://localhost:5001/api/v1' as never, 'getPost'),
					NodeInput,
					{
						getSelection: Effect.die('selection is not used in the post executor test'),
						getOwnPublicationInput: () =>
							Effect.die('own publication input is not used in the post executor test'),
						getNoteInput: () => Effect.die('note input is not used in the post executor test'),
						getDraftInput: () => Effect.die('draft input is not used in the post executor test'),
						getPostInput: () =>
							Effect.succeed({
								_tag: 'getPost',
								postId: 42,
							}),
						getProfileInput: () =>
							Effect.die('profile input is not used in the post executor test'),
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
										id: 42,
										title: 'Hello',
										slug: 'hello',
										url: 'https://example.com/p/hello',
										published_at: '2026-04-03T10:00:00.000Z',
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

		assert.equal(capturedUrl, 'http://localhost:5001/api/v1/posts/42');
		assert.deepEqual(result, [
			{
				json: {
					id: 42,
					title: 'Hello',
					slug: 'hello',
					url: 'https://example.com/p/hello',
					publishedAt: '2026-04-03T10:00:00.000Z',
				},
				pairedItem: { item: 0 },
			},
		]);
	});
});
