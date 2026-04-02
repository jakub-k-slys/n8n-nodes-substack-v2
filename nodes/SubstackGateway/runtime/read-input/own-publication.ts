import { Effect } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { OwnPublicationInput } from '../../domain/input';
import type { GatewayError } from '../../domain/error';
import type { GatewayOperation } from '../../domain/operation';
import { unexpectedError } from './shared';

export const readOwnPublicationInput = (
	_context: IExecuteFunctions,
	_itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'OwnPublication' }>,
): Effect.Effect<OwnPublicationInput, GatewayError> =>
	Effect.try({
		try: () => ({
			_tag: operation.operation,
		}),
		catch: unexpectedError,
	});
