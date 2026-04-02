import { Effect } from 'effect';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import type { GatewayUrl } from '../schema';
import { buildGatewayRequest } from './build-request';
import { decodeGatewayCommand } from './decode-command';
import { decodeGatewayResponse } from './decode-response';
import { executeGatewayRequest } from './execute-request';
import { makeGatewayClientLayer } from './gateway-client';
import { toNodeExecutionData } from './to-node-data';

export const runGatewayOperation = (
	context: IExecuteFunctions,
	itemIndex: number,
	gatewayUrl: GatewayUrl,
): Promise<INodeExecutionData[]> =>
	Effect.runPromise(
		Effect.provide(
			Effect.gen(function* () {
				const command = yield* decodeGatewayCommand(context, itemIndex);
				yield* Effect.logDebug('Decoded gateway command').pipe(
					Effect.annotateLogs({
						itemIndex,
						resource: command._tag,
						operation: command.command._tag,
					}),
				);

				const request = buildGatewayRequest(gatewayUrl, command);
				yield* Effect.logDebug('Built gateway request').pipe(
					Effect.annotateLogs({
						itemIndex,
						resource: command._tag,
						operation: command.command._tag,
						method: request.method,
						url: request.url,
					}),
				);

				const rawResponse = yield* executeGatewayRequest(request);
				const result = yield* decodeGatewayResponse(command, rawResponse);
				yield* Effect.logDebug('Decoded gateway response').pipe(
					Effect.annotateLogs({
						itemIndex,
						resource: result._tag,
						resultType: result.result._tag,
					}),
				);

				return toNodeExecutionData(itemIndex, result);
			}).pipe(
				Effect.tapError((error) =>
					Effect.logError('Gateway operation failed').pipe(
						Effect.annotateLogs({
							itemIndex,
							errorTag: error._tag,
						}),
					),
				),
			),
			makeGatewayClientLayer(context),
		),
	);
