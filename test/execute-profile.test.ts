import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { NodeInput } from '../nodes/SubstackGateway/runtime/node-input.ts';
import { executeProfileOperation } from '../nodes/SubstackGateway/runtime/resources/profile/index.ts';

describe('executeProfileOperation', () => {
	it('should execute a profile-local pipeline', async () => {
		let capturedUrl: string | undefined;

		const result = await Effect.runPromise(
			Effect.provideService(
				Effect.provideService(
					executeProfileOperation(0, 'http://localhost:5001/api/v1' as never, 'getProfile'),
					NodeInput,
					{
						getSelection: Effect.die('selection is not used in the profile executor test'),
						getOwnPublicationInput: () =>
							Effect.die('own publication input is not used in the profile executor test'),
						getNoteInput: () =>
							Effect.die('note input is not used in the profile executor test'),
						getDraftInput: () =>
							Effect.die('draft input is not used in the profile executor test'),
						getPostInput: () =>
							Effect.die('post input is not used in the profile executor test'),
						getProfileInput: () =>
							Effect.succeed({
								_tag: 'getProfile',
								profileSlug: 'substack',
							}),
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

		assert.equal(capturedUrl, 'http://localhost:5001/api/v1/profiles/substack');
		assert.deepEqual(result, {
			_tag: 'Profile',
			result: {
				_tag: 'Fetched',
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
