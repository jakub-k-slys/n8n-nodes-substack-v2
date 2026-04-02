import { Context, Effect, Layer } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { GatewayError } from '../domain/error';
import type { GatewayHttpRequest } from '../domain/http';

export type GatewayClient = {
	readonly execute: (request: GatewayHttpRequest) => Effect.Effect<unknown, GatewayError>;
};

export const GatewayClient = Context.GenericTag<GatewayClient>('GatewayClient');

const executeRequest = (
	context: IExecuteFunctions,
	request: GatewayHttpRequest,
): Effect.Effect<unknown, GatewayError> =>
	Effect.logDebug('Executing gateway HTTP request').pipe(
		Effect.annotateLogs({
			method: request.method,
			url: request.url,
			responseMode: request.responseMode,
		}),
		Effect.flatMap(() =>
			Effect.tryPromise({
				try: async () => {
					if (request.responseMode === 'empty') {
						await context.helpers.httpRequestWithAuthentication.call(context, 'substackGatewayApi', {
							json: true,
							method: request.method,
							url: request.url,
							...(request.qs !== undefined ? { qs: request.qs } : {}),
							...(request.body !== undefined ? { body: request.body } : {}),
						});

						return request.emptyResponseBody ?? {};
					}

					return await context.helpers.httpRequestWithAuthentication.call(
						context,
						'substackGatewayApi',
						{
							json: true,
							method: request.method,
							url: request.url,
							...(request.qs !== undefined ? { qs: request.qs } : {}),
							...(request.body !== undefined ? { body: request.body } : {}),
						},
					);
				},
				catch: (cause) =>
					({
						_tag: 'ApiError',
						message: cause instanceof Error ? cause.message : 'Gateway request failed',
						cause,
					}) satisfies GatewayError,
			}),
		),
		Effect.tapError((error) =>
			Effect.logError('Gateway HTTP request failed').pipe(
				Effect.annotateLogs({
					errorTag: error._tag,
					method: request.method,
					url: request.url,
				}),
			),
		),
	);

export const makeGatewayClientLayer = (context: IExecuteFunctions) =>
	Layer.succeed(GatewayClient, {
		execute: (request: GatewayHttpRequest) => executeRequest(context, request),
	});
