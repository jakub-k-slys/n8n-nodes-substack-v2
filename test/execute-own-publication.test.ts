import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { executeOwnPublicationOperation } from '../dist/nodes/SubstackGateway/runtime/execute-own-publication.js';

type TestContext = {
	getNodeParameter: (name: string, itemIndex?: number, fallback?: unknown) => unknown;
};

const createContext = (parameters: Record<string, unknown>): TestContext => ({
	getNodeParameter: (name, _itemIndex, fallback) => (name in parameters ? parameters[name] : fallback),
});

describe('executeOwnPublicationOperation', () => {
	it('should execute an own-publication-local pipeline', async () => {
		let capturedUrl: string | undefined;

		const result = await Effect.runPromise(
			Effect.provideService(
				executeOwnPublicationOperation(
					createContext({}) as never,
					0,
					'http://localhost:5001/api/v1' as never,
					'ownProfile',
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
										handle: 'substack',
										name: 'Substack',
										url: 'https://substack.com',
										avatar_url: 'https://cdn.example/avatar.png',
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

		assert.equal(capturedUrl, 'http://localhost:5001/api/v1/me');
		assert.deepEqual(result, [
			{
				json: {
					id: 1,
					handle: 'substack',
					name: 'Substack',
					url: 'https://substack.com',
					avatarUrl: 'https://cdn.example/avatar.png',
				},
				pairedItem: { item: 0 },
			},
		]);
	});
});
