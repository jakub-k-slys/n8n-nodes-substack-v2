import type {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';
import { Effect, Either } from 'effect';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { toGatewayApiBaseUrl } from '../shared/gateway-transport';
import { GatewayUrlSchema } from './schema';
import { decodeInput } from './runtime/decode/shared';
import { requireGatewayFeature } from './runtime/live/gateway-capabilities';
import {
	fetchAtomFeed,
	parseAtomFeed,
	readAtomFeedCheckpoint,
	selectNewAtomFeedEntries,
	toNodeExecutionData,
	writeAtomFeedCheckpoint,
} from '../shared/atom-feed';

const FOLLOWING_FEED_PATH = '/me/following/feed';
const FOLLOWING_FEED_FEATURE = 'api:me:following:feed';
const DEFAULT_MAXIMUM_ENTITY_COUNT = 10000;
const DEFAULT_REQUEST_TIMEOUT_SECONDS = 15 * 60;
const MILLISECONDS_PER_SECOND = 1000;

const getGatewayFeedUrl = (gatewayUrl: string): string => `${gatewayUrl}${FOLLOWING_FEED_PATH}`;

type FollowingFeedOptions = {
	readonly maximumEntityCount?: number;
	readonly requestTimeoutSeconds?: number;
};

export class FollowingFeed implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Substack Gateway Following Feed',
		name: 'substackGatewayFollowingFeed',
		icon: { light: 'file:substackGateway.svg', dark: 'file:substackGateway.dark.svg' },
		group: ['trigger'],
		version: 1,
		description: 'Poll the authenticated user following Atom feed from Substack Gateway',
		defaults: {
			name: 'Substack Gateway Following Feed',
		},
		usableAsTool: true,
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
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Maximum Entity Count',
						name: 'maximumEntityCount',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: DEFAULT_MAXIMUM_ENTITY_COUNT,
						description: 'Maximum number of XML entities to process while parsing the feed',
					},
					{
						displayName: 'Request Timeout',
						name: 'requestTimeoutSeconds',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: DEFAULT_REQUEST_TIMEOUT_SECONDS,
						description: 'Request timeout in seconds',
					},
				],
			},
		],
	};

	poll = async function (
		this: IPollFunctions,
	): Promise<INodeExecutionData[][] | null> {
		const credentials = await this.getCredentials('substackGatewayApi');
		const decodedGatewayUrl = decodeInput(
			GatewayUrlSchema,
			toGatewayApiBaseUrl(String(credentials.gatewayUrl ?? '')),
		);

		if (Either.isLeft(decodedGatewayUrl)) {
			throw new NodeOperationError(this.getNode(), 'Invalid Gateway URL credential');
		}

		await requireGatewayFeature(
			this,
			this.getNode(),
			decodedGatewayUrl.right,
			FOLLOWING_FEED_FEATURE,
			'Following Feed',
		);

		const pollState = this.getWorkflowStaticData('node');
		const emitOnlyNewItems = this.getNodeParameter('emitOnlyNewItems') as boolean;
		const options = this.getNodeParameter('options') as FollowingFeedOptions;
		const maximumEntityCount =
			options.maximumEntityCount ?? DEFAULT_MAXIMUM_ENTITY_COUNT;
		const requestTimeoutSeconds =
			options.requestTimeoutSeconds ?? DEFAULT_REQUEST_TIMEOUT_SECONDS;
		const data = await Effect.runPromise(
			Effect.flatMap(
				fetchAtomFeed(this, getGatewayFeedUrl(decodedGatewayUrl.right), {
					timeoutMs: requestTimeoutSeconds * MILLISECONDS_PER_SECOND,
				}),
				(xml) => parseAtomFeed(xml, { maxEntityCount: maximumEntityCount }),
			),
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
