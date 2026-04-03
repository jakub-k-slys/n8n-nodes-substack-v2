import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { NodeInput } from '../dist/nodes/SubstackGateway/runtime/node-input.js';
import { executeDraftOperation } from '../dist/nodes/SubstackGateway/runtime/resources/draft/index.js';

describe('executeDraftOperation', () => {
	it('should execute a draft-local pipeline', async () => {
		let capturedUrl: string | undefined;

		const result = await Effect.runPromise(
			Effect.provideService(
				Effect.provideService(
					executeDraftOperation(0, 'http://localhost:5001/api/v1' as never, 'createDraft'),
					NodeInput,
					{
						getSelection: Effect.die('selection is not used in the draft executor test'),
						getOwnPublicationInput: () =>
							Effect.die('own publication input is not used in the draft executor test'),
						getNoteInput: () => Effect.die('note input is not used in the draft executor test'),
						getDraftInput: () =>
							Effect.succeed({
								_tag: 'createDraft',
								title: 'Hello',
								subtitle: null,
								body: 'World',
							}),
						getPostInput: () => Effect.die('post input is not used in the draft executor test'),
						getProfileInput: () =>
							Effect.die('profile input is not used in the draft executor test'),
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
		assert.deepEqual(result, {
			_tag: 'Draft',
			result: {
				_tag: 'Created',
				item: {
					id: 7,
					uuid: 'draft-uuid',
				},
			},
		});
	});
});
