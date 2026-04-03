import { Effect, Layer, Match } from 'effect';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import type { GatewayUrl } from '../schema';
import { makeGatewayClientLayer } from './live/gateway-client';
import { makeNodeInputLayer } from './live/node-input';
import { NodeInput } from './node-input';
import {
	executeDraftOperation,
	executeNoteOperation,
	executeOwnPublicationOperation,
	executePostOperation,
	executeProfileOperation,
} from './resources';

export const runGatewayOperation = (
	context: IExecuteFunctions,
	itemIndex: number,
	gatewayUrl: GatewayUrl,
): Promise<INodeExecutionData[]> =>
	Effect.runPromise(
		Effect.provide(
			Effect.gen(function* () {
				const nodeInput = yield* NodeInput;
				const selection = yield* nodeInput.getSelection;
				return yield* Match.value(selection).pipe(
					Match.when({ resource: 'ownPublication' }, ({ operation }) =>
						executeOwnPublicationOperation(itemIndex, gatewayUrl, operation),
					),
					Match.when({ resource: 'note' }, ({ operation }) =>
						executeNoteOperation(itemIndex, gatewayUrl, operation),
					),
					Match.when({ resource: 'draft' }, ({ operation }) =>
						executeDraftOperation(itemIndex, gatewayUrl, operation),
					),
					Match.when({ resource: 'post' }, ({ operation }) =>
						executePostOperation(itemIndex, gatewayUrl, operation),
					),
					Match.when({ resource: 'profile' }, ({ operation }) =>
						executeProfileOperation(itemIndex, gatewayUrl, operation),
					),
					Match.orElse(({ resource, operation }) =>
						Effect.fail({
							_tag: 'UnsupportedOperation',
							resource,
							operation,
						} as const),
					),
				);
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
			Layer.merge(makeNodeInputLayer(context, itemIndex), makeGatewayClientLayer(context)),
		),
	);
