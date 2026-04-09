import * as ClientError from '@effect/platform/HttpClientError';
import { Effect } from 'effect';
import type { IAllExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';

export type GatewayRequestContext = {
	readonly helpers: {
		readonly httpRequestWithAuthentication: (
			this: IAllExecuteFunctions,
			credentialName: string,
			request: IHttpRequestOptions,
		) => Promise<unknown>;
	};
};

export const executeAuthenticatedGatewayRequest = (
	context: GatewayRequestContext,
	requestOptions: IHttpRequestOptions,
	requestLabel?: {
		readonly request?: ClientError.RequestError['request'];
		readonly url?: string;
		readonly method?: string;
	},
): Effect.Effect<unknown, ClientError.RequestError> =>
	Effect.logDebug('Executing authenticated gateway HTTP request').pipe(
		Effect.annotateLogs({
			method: requestLabel?.method ?? requestOptions.method,
			url: requestLabel?.url ?? requestOptions.url,
		}),
		Effect.flatMap(() =>
			Effect.tryPromise({
				try: () =>
					context.helpers.httpRequestWithAuthentication.call(
						context,
						'substackGatewayApi',
						requestOptions,
					),
				catch: (cause) =>
					new ClientError.RequestError({
						request: requestLabel?.request,
						reason: 'Transport',
						cause,
						description:
							cause instanceof Error ? cause.message : 'Gateway request failed',
					}),
			}),
		),
	);
