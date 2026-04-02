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
				const request = buildGatewayRequest(gatewayUrl, command);
				const rawResponse = yield* executeGatewayRequest(request);
				const result = yield* decodeGatewayResponse(command, rawResponse);

				return toNodeExecutionData(itemIndex, result);
			}),
			makeGatewayClientLayer(context),
		),
	);
