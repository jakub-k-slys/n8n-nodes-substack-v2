import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientError from '@effect/platform/HttpClientError';
import * as HttpClientRequest from '@effect/platform/HttpClientRequest';
import * as ClientResponse from '@effect/platform/HttpClientResponse';
import * as UrlParams from '@effect/platform/UrlParams';
import { Effect, Layer } from 'effect';
import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

const textDecoder = new TextDecoder();

const toResponseBody = (body: unknown) => {
	if (body === undefined || body === null) {
		return null;
	}

	if (typeof body === 'string') {
		return body;
	}

	return JSON.stringify(body);
};

const toRequestBody = (
	request: HttpClientRequest.HttpClientRequest,
): string | IDataObject | IDataObject[] | FormData | URLSearchParams => {
	switch (request.body._tag) {
		case 'Empty':
			throw new Error('Empty HttpClient bodies should not be encoded');
		case 'Raw':
			if (
				typeof request.body.body === 'string' ||
				request.body.body instanceof FormData ||
				request.body.body instanceof URLSearchParams
			) {
				return request.body.body;
			}

			if (Array.isArray(request.body.body)) {
				return request.body.body as IDataObject[];
			}

			if (typeof request.body.body === 'object' && request.body.body !== null) {
				return request.body.body as IDataObject;
			}

			throw new Error(`Unsupported raw HttpClient body type: ${typeof request.body.body}`);
		case 'Uint8Array': {
			const body = textDecoder.decode(request.body.body);
			return request.body.contentType.includes('json') ? JSON.parse(body) : body;
		}
		default:
			throw new Error(`Unsupported HttpClient body type: ${request.body._tag}`);
	}
};

const toRequestMethod = (
	method: HttpClientRequest.HttpClientRequest['method'],
): IHttpRequestMethods => {
	switch (method) {
		case 'GET':
		case 'POST':
		case 'PUT':
		case 'DELETE':
		case 'PATCH':
		case 'HEAD':
			return method;
		default:
			throw new Error(`Unsupported HttpClient method: ${method}`);
	}
};

const toRequestOptions = (
	request: HttpClientRequest.HttpClientRequest,
	url: URL,
): Effect.Effect<IHttpRequestOptions, ClientError.RequestError> =>
	Effect.try({
		try: () =>
			({
				json: true,
				returnFullResponse: true,
				method: toRequestMethod(request.method),
				url: url.toString(),
				...(Object.keys(request.headers).length === 0 ? {} : { headers: request.headers }),
				...(request.urlParams.length === 0 ? {} : { qs: UrlParams.toRecord(request.urlParams) }),
				...(request.body._tag === 'Empty' ? {} : { body: toRequestBody(request) }),
			}) satisfies IHttpRequestOptions,
		catch: (cause) =>
			new ClientError.RequestError({
				request,
				reason: 'Encode',
				cause,
				description: 'Failed to encode HttpClient request for n8n transport',
			}),
	});

const toClientResponse = (
	request: HttpClientRequest.HttpClientRequest,
	result: unknown,
): ClientResponse.HttpClientResponse => {
	const response =
		typeof result === 'object' && result !== null && 'statusCode' in result
			? (result as {
					body?: unknown;
					headers?: Record<string, string>;
					statusCode: number;
					statusMessage?: string;
				})
			: { body: result, headers: {}, statusCode: 200 };

	const headers = {
		...(response.headers ?? {}),
		...(response.body !== null &&
		response.body !== undefined &&
		typeof response.body !== 'string' &&
		(response.headers?.['content-type'] ?? response.headers?.['Content-Type']) === undefined
			? { 'content-type': 'application/json' }
			: {}),
	};

	return ClientResponse.fromWeb(
		request,
		new Response(toResponseBody(response.body), {
			status: response.statusCode,
			statusText: response.statusMessage,
			headers,
		}),
	);
};

const makeExecute = (context: IExecuteFunctions) =>
	HttpClient.make((request, url) =>
		Effect.logDebug('Executing gateway HTTP request').pipe(
			Effect.annotateLogs({
				method: request.method,
				url: url.toString(),
			}),
			Effect.flatMap(() => toRequestOptions(request, url)),
			Effect.flatMap((requestOptions) =>
				Effect.tryPromise({
					try: () =>
						context.helpers.httpRequestWithAuthentication.call(
							context,
							'substackGatewayApi',
							requestOptions,
						),
					catch: (cause) =>
						new ClientError.RequestError({
							request,
							reason: 'Transport',
							cause,
							description: cause instanceof Error ? cause.message : 'Gateway request failed',
						}),
				}),
			),
			Effect.map((result) => toClientResponse(request, result)),
			Effect.tapError((error) =>
				Effect.logError('Gateway HTTP request failed').pipe(
					Effect.annotateLogs({
						errorTag: error._tag,
						method: request.method,
						url: url.toString(),
					}),
				),
			),
		),
	);

export const makeGatewayClientLayer = (context: IExecuteFunctions) =>
	Layer.succeed(HttpClient.HttpClient, makeExecute(context));
