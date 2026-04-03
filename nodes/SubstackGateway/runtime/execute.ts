import { Effect, Match } from 'effect';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import type { GatewayUrl } from '../schema';
import { makeGatewayClientLayer } from './gateway-client';
import { readGatewaySelection } from './read-input';
import { executeDraftOperation } from './resources/draft/execute';
import { executeNoteOperation } from './resources/note/execute';
import { executeOwnPublicationOperation } from './resources/own-publication/execute';
import { executePostOperation } from './resources/post/execute';
import { executeProfileOperation } from './resources/profile/execute';

export const runGatewayOperation = (
	context: IExecuteFunctions,
	itemIndex: number,
	gatewayUrl: GatewayUrl,
): Promise<INodeExecutionData[]> =>
	Effect.runPromise(
		Effect.provide(
			Effect.gen(function* () {
				const selection = yield* readGatewaySelection(context, itemIndex);
				return yield* Match.value(selection).pipe(
					Match.when({ resource: 'ownPublication' }, ({ operation }) =>
						executeOwnPublicationOperation(context, itemIndex, gatewayUrl, operation),
					),
					Match.when({ resource: 'note' }, ({ operation }) =>
						executeNoteOperation(context, itemIndex, gatewayUrl, operation),
					),
					Match.when({ resource: 'draft' }, ({ operation }) =>
						executeDraftOperation(context, itemIndex, gatewayUrl, operation),
					),
					Match.when({ resource: 'post' }, ({ operation }) =>
						executePostOperation(context, itemIndex, gatewayUrl, operation),
					),
					Match.when({ resource: 'profile' }, ({ operation }) =>
						executeProfileOperation(context, itemIndex, gatewayUrl, operation),
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
			makeGatewayClientLayer(context),
		),
	);
