import { Either, Effect, Schema } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import {
	executeAuthenticatedGatewayRequest,
	toGatewayRootUrl,
} from '../../../shared/gateway-transport';
import { GatewayCapabilitiesSchema, type GatewayCapabilities } from '../../schema';

export const fetchGatewayCapabilities = async (
	context: IExecuteFunctions,
	gatewayUrl: string,
): Promise<GatewayCapabilities> => {
	const response = await Effect.runPromise(
		executeAuthenticatedGatewayRequest(context, {
			method: 'GET',
			url: toGatewayRootUrl(gatewayUrl),
			json: true,
		}),
	);

	const decoded = Schema.decodeUnknownEither(GatewayCapabilitiesSchema)(response);

	if (Either.isLeft(decoded)) {
		throw new Error('Invalid gateway capabilities response');
	}

	return decoded.right;
};
