import { Effect } from 'effect';

import type { GatewayError } from '../domain/error';
import type { GatewayHttpRequest } from '../domain/http';
import { GatewayClient } from './gateway-client';

export const executeGatewayRequest = (
	request: GatewayHttpRequest,
): Effect.Effect<unknown, GatewayError, GatewayClient> =>
	Effect.flatMap(GatewayClient, (client) => client.execute(request));
