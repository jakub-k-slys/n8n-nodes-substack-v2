import { Either, Effect, Schema } from 'effect';
import { NodeOperationError, type IAllExecuteFunctions, type INode } from 'n8n-workflow';

import {
	executeAuthenticatedGatewayRequest,
	toGatewayRootUrl,
} from '../../../shared/gateway-transport';
import { GatewayCapabilitiesSchema, type GatewayCapabilities } from '../../schema';

export const fetchGatewayCapabilities = async (
	context: IAllExecuteFunctions,
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

export const requireGatewayFeature = async (
	context: IAllExecuteFunctions,
	node: INode,
	gatewayUrl: string,
	requiredFeature: string,
	displayName: string,
): Promise<void> => {
	const capabilities = await fetchGatewayCapabilities(context, gatewayUrl);

	if (!capabilities.features.includes(requiredFeature)) {
		throw new NodeOperationError(
			node,
			`This Substack Gateway does not support "${displayName}". Required feature: ${requiredFeature}. Current tier: ${capabilities.tier}.`,
		);
	}
};
