import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from './shared/SubstackGatewayClient';
import { IStandardResponse } from './types';
import { DataFormatters } from './shared/DataFormatters';
import { OperationUtils } from './shared/OperationUtils';
import { OperationHandler } from './shared/OperationHandler';

export enum PostOperation {
	GetAll = 'getAll',
	GetPostsBySlug = 'getPostsBySlug',
	GetPostById = 'getPostById',
}

export const postOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'getAll',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['post'],
			},
		},
		options: [
			{
				name: 'Get All Posts',
				value: PostOperation.GetAll,
				description: 'Get all posts from own profile',
				action: 'Get all posts',
			},
			{
				name: 'Get Posts From Profile by Slug',
				value: PostOperation.GetPostsBySlug,
				description: 'Get posts from a profile by its publication slug',
				action: 'Get posts by slug',
			},
			{
				name: 'Get Post by ID',
				value: PostOperation.GetPostById,
				description: 'Get a specific post by its ID',
				action: 'Get post by ID',
			},
		],
	},
];

async function getAll(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	return OperationHandler.execute(executeFunctions, itemIndex, async () => {
		const limit = OperationHandler.getLimit(executeFunctions, itemIndex);
		const profile = await OperationHandler.resolveProfile(client);
		return OperationHandler.collectFromIterable(profile.posts(), limit, (post) =>
			DataFormatters.formatPost(post, publicationAddress),
		);
	});
}

async function getPostsBySlug(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	return OperationHandler.execute(executeFunctions, itemIndex, async () => {
		const slug = executeFunctions.getNodeParameter('slug', itemIndex) as string;
		const limit = OperationHandler.getLimit(executeFunctions, itemIndex);
		const profile = await OperationHandler.resolveProfile(client, slug);
		return OperationHandler.collectFromIterable(profile.posts(), limit, (post) =>
			DataFormatters.formatPost(post, publicationAddress),
		);
	});
}

async function getPostById(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	return OperationHandler.execute(executeFunctions, itemIndex, async () => {
		const postId = OperationUtils.parseNumericParam(
			executeFunctions.getNodeParameter('postId', itemIndex),
			'postId',
		);

		const post = await client.postForId(postId);
		return DataFormatters.formatPost(post, publicationAddress);
	});
}

export const postOperationHandlers: Record<
	PostOperation,
	(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) => Promise<IStandardResponse>
> = {
	[PostOperation.GetAll]: getAll,
	[PostOperation.GetPostsBySlug]: getPostsBySlug,
	[PostOperation.GetPostById]: getPostById,
};
