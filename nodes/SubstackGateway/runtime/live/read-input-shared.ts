import { Effect } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { GatewayError } from '../../domain/error';
import type { GatewayOperation } from '../../domain/operation';
import { decodeGatewayOperation } from '../decode-operation';

export const unexpectedError = (cause: unknown): GatewayError =>
	({
		_tag: 'UnexpectedError',
		message: cause instanceof Error ? cause.message : 'Unknown error',
		cause,
	}) satisfies GatewayError;

export const readSelection = (
	context: IExecuteFunctions,
	itemIndex: number,
): Effect.Effect<GatewayOperation, GatewayError> =>
	Effect.try({
		try: () => {
			const resource = String(context.getNodeParameter('resource', itemIndex));
			const operation = String(context.getNodeParameter('operation', itemIndex));
			return { resource, operation };
		},
		catch: unexpectedError,
	}).pipe(
		Effect.flatMap(({ resource, operation }) => {
			const decoded = decodeGatewayOperation(resource, operation);
			return decoded._tag === 'Right' ? Effect.succeed(decoded.right) : Effect.fail(decoded.left);
		}),
	);
