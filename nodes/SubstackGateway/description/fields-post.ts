import type { INodeProperties } from 'n8n-workflow';

export const postFields: INodeProperties[] = [
	{
		displayName: 'Post ID',
		name: 'postId',
		type: 'number',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['getPost', 'getPostComments', 'likePost', 'unlikePost'],
			},
		},
		description: 'The numeric ID of the post',
	},
];
