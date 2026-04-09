import * as HttpClient from '@effect/platform/HttpClient';
import * as ClientError from '@effect/platform/HttpClientError';
import { Effect, Layer } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import { executeAuthenticatedGatewayRequest } from '../../../shared/gateway-transport';
import { toRequestOptions } from './gateway-request';
import { toClientResponse } from './gateway-response';

const makeExecute = (context: IExecuteFunctions) =>
	HttpClient.make((request, url) =>
		Effect.logDebug('Executing gateway HTTP request').pipe(
			Effect.annotateLogs({
				method: request.method,
				url: url.toString(),
			}),
			Effect.flatMap(() => toRequestOptions(request, url)),
			Effect.flatMap((requestOptions) =>
				executeAuthenticatedGatewayRequest(context, requestOptions, {
					request,
					method: request.method,
					url: url.toString(),
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
