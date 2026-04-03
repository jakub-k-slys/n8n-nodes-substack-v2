import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { executeDraftOperation } from '../dist/nodes/SubstackGateway/runtime/execute-draft.js';

type TestContext = {
	getNodeParameter: (name: string, itemIndex?: number, fallback?: unknown) => unknown;
};

const createContext = (parameters: Record<string, unknown>): TestContext => ({
	getNodeParameter: (name, _itemIndex, fallback) => (name in parameters ? parameters[name] : fallback),
});

describe('executeDraftOperation', () => {
	it('should execute a draft-local pipeline', async () => {
		let capturedUrl: string | undefined;

		const result = await Effect.runPromise(
			Effect.provideService(
				executeDraftOperation(
					createContext({
						title: 'Hello',
						subtitle: '',
						body: 'World',
					}) as never,
					0,
					'http://localhost:5001/api/v1' as never,
					'createDraft',
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
										id: 7,
										uuid: 'draft-uuid',
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

		assert.equal(capturedUrl, 'http://localhost:5001/api/v1/drafts');
		assert.deepEqual(result, [
			{
				json: {
					id: 7,
					uuid: 'draft-uuid',
				},
				pairedItem: { item: 0 },
			},
		]);
	});
});
