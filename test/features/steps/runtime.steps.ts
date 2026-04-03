import assert from 'node:assert/strict';

import * as HttpClient from '@effect/platform/HttpClient';
import type * as ClientRequest from '@effect/platform/HttpClientRequest';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import { Given, Then, When } from '@cucumber/cucumber';
import { Either, Effect, Match } from 'effect';

import { decodeGatewayOperation } from '../../../nodes/SubstackGateway/runtime/decode-operation.ts';
import { executeGatewayRequest } from '../../../nodes/SubstackGateway/runtime/execute-request.ts';
import { makeGatewayClientLayer } from '../../../nodes/SubstackGateway/runtime/live/gateway-client.ts';
import { makeNodeInputLayer } from '../../../nodes/SubstackGateway/runtime/live/node-input.ts';
import {
	NodeInput,
} from '../../../nodes/SubstackGateway/runtime/node-input.ts';
import { gatewayResultToJsonItems } from '../../../nodes/SubstackGateway/runtime/to-json.ts';

type TestContext = {
	getNodeParameter: (name: string, itemIndex?: number, fallback?: unknown) => unknown;
};

type State = {
	command?: any;
	context?: TestContext;
	resource?: string;
	operation?: string;
	typedOperation?: any;
	request?: any;
	rawResponse?: any;
	result?: any;
	error?: unknown;
	serviceResponse?: any;
	capturedRequest?: any;
	liveCall?: any;
};

const state: State = {};

const parseJson = (value: string) => JSON.parse(value);
const textDecoder = new TextDecoder();

const createContext = (parameters: Record<string, unknown>): TestContext => ({
	getNodeParameter: (name, _itemIndex, fallback) => (name in parameters ? parameters[name] : fallback),
});

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

const summarizeN8nRequest = (request: Record<string, unknown>) => ({
	json: request.json,
	returnFullResponse: request.returnFullResponse,
	method: request.method,
	url: request.url,
	...(request.qs === undefined ? {} : { qs: request.qs }),
	...(request.body === undefined ? {} : { body: request.body }),
});

Given('the gateway request:', function (docString: string) {
	state.request = parseJson(docString);
});

Given('the gateway resource {string} and operation {string}', function (resource: string, operation: string) {
	state.resource = resource;
	state.operation = operation;
});

Given('the gateway context parameters:', function (docString: string) {
	state.context = createContext(parseJson(docString));
});

Given('the typed gateway operation:', function (docString: string) {
	state.typedOperation = parseJson(docString);
});

Given('an HttpClient service response:', function (docString: string) {
	state.serviceResponse = parseJson(docString);
});

Given('the gateway result:', function (docString: string) {
	state.result = parseJson(docString);
});

When('I decode the gateway operation', function () {
	const decoded = decodeGatewayOperation(state.resource!, state.operation!);
	if (Either.isRight(decoded)) {
		state.result = decoded.right;
		state.error = undefined;
		return;
	}

	state.result = undefined;
	state.error = decoded.left;
});

When('I read gateway input', async function () {
	state.result = await Effect.runPromise(
		Effect.flatMap(NodeInput, (nodeInput) =>
			Match.value(state.typedOperation).pipe(
				Match.when({ _tag: 'OwnPublication' }, (typedOperation) =>
					nodeInput.getOwnPublicationInput(typedOperation),
				),
				Match.when({ _tag: 'Note' }, (typedOperation) => nodeInput.getNoteInput(typedOperation)),
				Match.when({ _tag: 'Draft' }, (typedOperation) => nodeInput.getDraftInput(typedOperation)),
				Match.when({ _tag: 'Post' }, (typedOperation) => nodeInput.getPostInput(typedOperation)),
				Match.when({ _tag: 'Profile' }, (typedOperation) =>
					nodeInput.getProfileInput(typedOperation),
				),
				Match.exhaustive,
			),
		).pipe(Effect.provide(makeNodeInputLayer(state.context as never, 0))),
	);
});

When('I execute the gateway request through the service', async function () {
	state.result = await Effect.runPromise(
		Effect.provideService(executeGatewayRequest(state.request), HttpClient.HttpClient, {
			...HttpClient.make(() => Effect.die('execute should be overridden by the test service')),
			execute: (request) => {
				state.capturedRequest = summarizeRequest(request);
				return Effect.succeed(
					ClientResponse.fromWeb(
						request,
						new Response(JSON.stringify(state.serviceResponse), {
							status: 200,
							headers: { 'content-type': 'application/json' },
						}),
					),
				);
			},
		}),
	);
});

When('I execute the gateway request through the live layer', async function () {
	const calls: Array<{ credentialName: string; request: unknown; self: unknown }> = [];
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

	state.result = await Effect.runPromise(
		Effect.provide(executeGatewayRequest(state.request), makeGatewayClientLayer(context as never)),
	);
	state.liveCall = {
		credentialName: calls[0].credentialName,
		request: summarizeN8nRequest(calls[0].request as Record<string, unknown>),
	};
});

When('I serialize the gateway result', function () {
	state.result = gatewayResultToJsonItems(state.result);
});

Then('the decoded gateway operation should equal:', function (docString: string) {
	assert.deepEqual(state.result, parseJson(docString));
});

Then('the gateway operation error should equal:', function (docString: string) {
	assert.deepEqual(state.error, parseJson(docString));
});

Then('the read gateway input should equal:', function (docString: string) {
	assert.deepEqual(state.result, parseJson(docString));
});

Then('the executed gateway response should equal:', function (docString: string) {
	assert.deepEqual(state.result, parseJson(docString));
});

Then('the executed gateway request should equal:', function (docString: string) {
	assert.deepEqual(state.capturedRequest, parseJson(docString));
});

Then('the live gateway call should equal:', function (docString: string) {
	assert.deepEqual(state.liveCall, parseJson(docString));
});

Then('the serialized gateway items should equal:', function (docString: string) {
	assert.deepEqual(state.result, parseJson(docString));
});
