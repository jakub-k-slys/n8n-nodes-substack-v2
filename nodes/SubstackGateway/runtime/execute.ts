import { Effect } from 'effect';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import type { GatewayUrl } from '../schema';
import { executeDraftOperation } from './execute-draft';
import { executeOwnPublicationOperation } from './execute-own-publication';
import { executePostOperation } from './execute-post';
import { executeProfileOperation } from './execute-profile';
import { executeNoteOperation } from './execute-note';
import { makeGatewayClientLayer } from './gateway-client';
import { readGatewaySelection } from './read-input';

export const runGatewayOperation = (
	context: IExecuteFunctions,
	itemIndex: number,
	gatewayUrl: GatewayUrl,
): Promise<INodeExecutionData[]> =>
	Effect.runPromise(
		Effect.provide(
			Effect.gen(function* () {
				const selection = yield* readGatewaySelection(context, itemIndex);

				if (selection.resource === 'ownPublication') {
					return yield* executeOwnPublicationOperation(
						context,
						itemIndex,
						gatewayUrl,
						selection.operation,
					);
				}

				if (selection.resource === 'note') {
					return yield* executeNoteOperation(context, itemIndex, gatewayUrl, selection.operation);
				}

				if (selection.resource === 'draft') {
					return yield* executeDraftOperation(context, itemIndex, gatewayUrl, selection.operation);
				}

				if (selection.resource === 'post') {
					return yield* executePostOperation(context, itemIndex, gatewayUrl, selection.operation);
				}

				if (selection.resource === 'profile') {
					return yield* executeProfileOperation(context, itemIndex, gatewayUrl, selection.operation);
				}
				return yield* Effect.fail({
					_tag: 'UnsupportedOperation',
					resource: selection.resource,
					operation: selection.operation,
				} as const);
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
