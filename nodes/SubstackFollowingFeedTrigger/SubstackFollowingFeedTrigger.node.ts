import type {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';
import { Effect, Either } from 'effect';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { GatewayUrlSchema } from '../SubstackGateway/schema';
import { decodeInput } from '../SubstackGateway/runtime/decode/shared';
import {
	fetchAtomFeed,
	parseAtomFeed,
	readAtomFeedCheckpoint,
	selectNewAtomFeedEntries,
	toNodeExecutionData,
	writeAtomFeedCheckpoint,
} from '../shared/atom-feed';

const FOLLOWING_FEED_PATH = '/me/following/feed';

const getGatewayFeedUrl = (gatewayUrl: string): string => `${gatewayUrl}${FOLLOWING_FEED_PATH}`;

export class SubstackFollowingFeedTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Following Feed Trigger',
		name: 'substackFollowingFeedTrigger',
		icon: { light: 'file:../SubstackGateway/substackGateway.svg', dark: 'file:../SubstackGateway/substackGateway.dark.svg' },
		group: ['trigger'],
		version: 1,
		description: 'Poll the authenticated user following Atom feed from Substack Gateway',
		defaults: {
			name: 'Following Feed Trigger',
		},
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'substackGatewayApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Emit Only New Items',
				name: 'emitOnlyNewItems',
				type: 'boolean',
				default: true,
				description:
					'Whether to skip the existing feed items on the first poll and emit only items discovered later',
			},
		],
	};

	poll = async function (
		this: IPollFunctions,
	): Promise<INodeExecutionData[][] | null> {
		const credentials = await this.getCredentials('substackGatewayApi');
		const decodedGatewayUrl = decodeInput(
			GatewayUrlSchema,
			String(credentials.gatewayUrl ?? '').replace(/\/+$/, ''),
		);

		if (Either.isLeft(decodedGatewayUrl)) {
			throw new NodeOperationError(this.getNode(), 'Invalid Gateway URL credential');
		}

		const pollState = this.getWorkflowStaticData('node');
		const emitOnlyNewItems = this.getNodeParameter('emitOnlyNewItems') as boolean;
		const data = await Effect.runPromise(
			Effect.flatMap(fetchAtomFeed(this, getGatewayFeedUrl(decodedGatewayUrl.right)), parseAtomFeed),
		);

		if (this.getMode() === 'manual') {
			const items = toNodeExecutionData(data.entries);

			return items.length === 0 ? null : [items];
		}

		const nextState = selectNewAtomFeedEntries({
			entries: data.entries,
			checkpoint: readAtomFeedCheckpoint(pollState),
			emitOnlyNewItems,
		});

		if (nextState.checkpoint !== undefined) {
			writeAtomFeedCheckpoint(pollState, nextState.checkpoint);
		}

		const items = toNodeExecutionData(nextState.entries);

		return items.length === 0 ? null : [items];
	};
}
