import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { NodeInput } from '../dist/nodes/SubstackGateway/runtime/node-input.js';
import { executeOwnPublicationOperation } from '../dist/nodes/SubstackGateway/runtime/resources/own-publication/index.js';

describe('executeOwnPublicationOperation', () => {
	it('should execute an own-publication-local pipeline', async () => {
		let capturedUrl: string | undefined;

		const result = await Effect.runPromise(
			Effect.provideService(
				Effect.provideService(
					executeOwnPublicationOperation(
						0,
						'http://localhost:5001/api/v1' as never,
						'ownProfile',
					),
					NodeInput,
					{
						getSelection: Effect.die(
							'selection is not used in the own-publication executor test',
						),
						getOwnPublicationInput: () =>
							Effect.succeed({
								_tag: 'ownProfile',
							}),
						getNoteInput: () =>
							Effect.die('note input is not used in the own-publication executor test'),
						getDraftInput: () =>
							Effect.die('draft input is not used in the own-publication executor test'),
						getPostInput: () =>
							Effect.die('post input is not used in the own-publication executor test'),
						getProfileInput: () =>
							Effect.die('profile input is not used in the own-publication executor test'),
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
		assert.deepEqual(result, {
			_tag: 'OwnPublication',
			result: {
				_tag: 'Profile',
				item: {
					id: 1,
					handle: 'substack',
					name: 'Substack',
					url: 'https://substack.com',
					avatarUrl: 'https://cdn.example/avatar.png',
				},
			},
		});
	});
});
