import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HttpClient from '@effect/platform/HttpClient';
import type * as ClientRequest from '@effect/platform/HttpClientRequest';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Effect } from 'effect';

import { makeGatewayClientLayer } from '../nodes/SubstackGateway/runtime/live/gateway-client.ts';
import { executeGatewayRequest } from '../nodes/SubstackGateway/runtime/execute-request.ts';

const textDecoder = new TextDecoder();

const summarizeRequest = (request: ClientRequest.HttpClientRequest) => ({
	method: request.method,
	url: request.url,
	urlParams: Object.fromEntries(request.urlParams),
	headers: { ...request.headers },
	body:
		request.body._tag === 'Empty'
			? null
			: request.body._tag === 'Uint8Array'
				? JSON.parse(textDecoder.decode(request.body.body))
				: request.body._tag === 'Raw'
					? request.body.body
					: request.body._tag,
});

describe('gateway HttpClient layer', () => {
	it('should delegate executeGatewayRequest through HttpClient', async () => {
		let capturedRequest: ClientRequest.HttpClientRequest | undefined;

		const response = await Effect.runPromise(
			Effect.provideService(executeGatewayRequest({
				method: 'GET',
				url: 'http://localhost:5001/api/v1/me',
				responseMode: 'single',
			}), HttpClient.HttpClient, {
				...HttpClient.make(() =>
					Effect.die('execute should be overridden by the test service'),
				),
				execute: (request) => {
					capturedRequest = request;
					return Effect.succeed(
						ClientResponse.fromWeb(
							request,
							new Response(JSON.stringify({ ok: true }), {
								status: 200,
								headers: { 'content-type': 'application/json' },
							}),
						),
					);
				},
			}),
		);

		assert.deepEqual(summarizeRequest(capturedRequest!), {
			method: 'GET',
			url: 'http://localhost:5001/api/v1/me',
			urlParams: {},
			headers: {},
			body: null,
		});
		assert.deepEqual(response, { ok: true });
	});

	it('should build a live HttpClient layer from n8n context', async () => {
		const calls: Array<{
			credentialName: string;
			request: unknown;
			self: unknown;
		}> = [];
		const context = {
			helpers: {
				httpRequestWithAuthentication(this: unknown, credentialName: string, request: unknown) {
					calls.push({ credentialName, request, self: this });
					return Promise.resolve({
						body: { ok: true },
						headers: { 'content-type': 'application/json' },
						statusCode: 200,
					});
				},
			},
		};

		const response = await Effect.runPromise(
			Effect.provide(
				executeGatewayRequest({
					method: 'GET',
					url: 'http://localhost:5001/api/v1/me',
					responseMode: 'single',
				}),
				makeGatewayClientLayer(context as never),
			),
		);

		assert.deepEqual(response, { ok: true });
		assert.equal(calls.length, 1);
		assert.equal(calls[0].credentialName, 'substackGatewayApi');
		assert.equal(calls[0].self, context);
		assert.deepEqual(
			{
				json: (calls[0].request as Record<string, unknown>).json,
				returnFullResponse: (calls[0].request as Record<string, unknown>).returnFullResponse,
				method: (calls[0].request as Record<string, unknown>).method,
				url: (calls[0].request as Record<string, unknown>).url,
			},
			{
			json: true,
			returnFullResponse: true,
			method: 'GET',
			url: 'http://localhost:5001/api/v1/me',
			},
		);
	});
});
