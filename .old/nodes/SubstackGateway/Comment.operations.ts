import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from './shared/SubstackGatewayClient';
import { IStandardResponse } from './types';
import { DataFormatters } from './shared/DataFormatters';
import { OperationUtils } from './shared/OperationUtils';
import { OperationHandler } from './shared/OperationHandler';

export enum CommentOperation {
	GetAll = 'getAll',
}

export const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'getAll',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['comment'],
			},
		},
		options: [
			{
				name: 'Get All Comments',
				value: CommentOperation.GetAll,
				description: 'Get all comments for a specific post',
				action: 'Get all comments',
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
		const postId = OperationUtils.parseNumericParam(
			executeFunctions.getNodeParameter('postId', itemIndex),
			'postId',
		);
		const limit = OperationHandler.getLimit(executeFunctions, itemIndex);

		const post = await client.postForId(postId);
		return OperationHandler.collectFromIterable(post.comments(), limit, (comment) =>
			DataFormatters.formatComment(comment, postId),
		);
	});
}

export const commentOperationHandlers: Record<
	CommentOperation,
	(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) => Promise<IStandardResponse>
> = {
	[CommentOperation.GetAll]: getAll,
};
