import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { executePostOperation } from '../dist/nodes/SubstackGateway/runtime/execute-post.js';

type TestContext = {
	getNodeParameter: (name: string, itemIndex?: number, fallback?: unknown) => unknown;
};

const createContext = (parameters: Record<string, unknown>): TestContext => ({
	getNodeParameter: (name, _itemIndex, fallback) => (name in parameters ? parameters[name] : fallback),
});

describe('executePostOperation', () => {
	it('should execute a post-local pipeline', async () => {
		let capturedUrl: string | undefined;

		const result = await Effect.runPromise(
			Effect.provideService(
				executePostOperation(
					createContext({
						postId: 42,
					}) as never,
					0,
					'http://localhost:5001/api/v1' as never,
					'getPost',
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
