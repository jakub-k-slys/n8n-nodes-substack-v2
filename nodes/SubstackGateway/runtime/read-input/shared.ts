import { Effect } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { GatewayError } from '../../domain/error';

export const unexpectedError = (cause: unknown): GatewayError =>
	({
		_tag: 'UnexpectedError',
		message: cause instanceof Error ? cause.message : 'Unknown error',
		cause,
	}) satisfies GatewayError;

export const readSelection = (
	context: IExecuteFunctions,
	itemIndex: number,
): Effect.Effect<{ readonly resource: string; readonly operation: string }, GatewayError> =>
	Effect.try({
		try: () => ({
			resource: String(context.getNodeParameter('resource', itemIndex)),
			operation: String(context.getNodeParameter('operation', itemIndex)),
		}),
		catch: unexpectedError,
	});
