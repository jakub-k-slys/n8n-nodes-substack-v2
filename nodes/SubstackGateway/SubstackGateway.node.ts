import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

const resourceOptions: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	default: 'ownPublication',
	options: [
		{
			name: 'Draft',
			value: 'draft',
		},
		{
			name: 'Note',
			value: 'note',
		},
		{
			name: 'Own Publication',
			value: 'ownPublication',
		},
		{
			name: 'Post',
			value: 'post',
		},
		{
			name: 'Profile',
			value: 'profile',
		},
	],
};

const ownPublicationOperationOptions: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	default: 'ownProfile',
	displayOptions: {
		show: {
			resource: ['ownPublication'],
		},
	},
	options: [
		{
			name: 'Own Following',
			value: 'ownFollowing',
			action: 'Get own following',
			description: 'Get the accounts followed by the authenticated user',
		},
		{
			name: 'Own Notes',
			value: 'ownNotes',
			action: 'Get own notes',
			description: 'Get notes from the authenticated user',
		},
		{
			name: 'Own Posts',
			value: 'ownPosts',
			action: 'Get own posts',
			description: 'Get posts from the authenticated user',
		},
		{
			name: 'Own Profile',
			value: 'ownProfile',
			action: 'Get own profile',
			description: 'Get the authenticated user profile from Substack Gateway',
		},
	],
};

const notesOperationOptions: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	default: 'createNote',
	displayOptions: {
		show: {
			resource: ['note'],
		},
	},
	options: [
		{
			name: 'Create',
			value: 'createNote',
			action: 'Create a note',
		},
		{
			name: 'Delete',
			value: 'deleteNote',
			action: 'Delete a note',
		},
		{
			name: 'Get',
			value: 'getNote',
			action: 'Get a note',
		},
	],
};

const draftsOperationOptions: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	default: 'listDrafts',
	displayOptions: {
		show: {
			resource: ['draft'],
		},
	},
	options: [
		{
			name: 'Create',
			value: 'createDraft',
			action: 'Create a draft',
		},
		{
			name: 'Delete',
			value: 'deleteDraft',
			action: 'Delete a draft',
		},
		{
			name: 'Get',
			value: 'getDraft',
			action: 'Get a draft',
		},
		{
			name: 'Get Many',
			value: 'listDrafts',
			action: 'Get many drafts',
		},
		{
			name: 'Update',
			value: 'updateDraft',
			action: 'Update a draft',
		},
	],
};

const postsOperationOptions: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	default: 'getPost',
	displayOptions: {
		show: {
			resource: ['post'],
		},
	},
	options: [
		{
			name: 'Get',
			value: 'getPost',
			action: 'Get a post',
		},
		{
			name: 'Get Comments',
			value: 'getPostComments',
			action: 'Get comments for a post',
		},
	],
};

const profilesOperationOptions: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	default: 'getProfile',
	displayOptions: {
		show: {
			resource: ['profile'],
		},
	},
	options: [
		{
			name: 'Get',
			value: 'getProfile',
			action: 'Get a profile',
		},
		{
			name: 'Get Notes',
			value: 'getProfileNotes',
			action: 'Get notes for a profile',
		},
		{
			name: 'Get Posts',
			value: 'getProfilePosts',
			action: 'Get posts for a profile',
		},
	],
};

const noteIdField: INodeProperties = {
	displayName: 'Note ID',
	name: 'noteId',
	type: 'number',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['note'],
			operation: ['deleteNote', 'getNote'],
		},
	},
	description: 'The numeric ID of the note',
};

const noteContentField: INodeProperties = {
	displayName: 'Content',
	name: 'content',
	type: 'string',
	required: true,
	default: '',
	typeOptions: {
		rows: 6,
	},
	displayOptions: {
		show: {
			resource: ['note'],
			operation: ['createNote'],
		},
	},
	description: 'Markdown content to publish as a note',
};

const noteAttachmentField: INodeProperties = {
	displayName: 'Attachment',
	name: 'attachment',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['note'],
			operation: ['createNote'],
		},
	},
	description: 'Optional attachment URL or identifier',
};

const draftIdField: INodeProperties = {
	displayName: 'Draft ID',
	name: 'draftId',
	type: 'number',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['draft'],
			operation: ['deleteDraft', 'getDraft', 'updateDraft'],
		},
	},
	description: 'The numeric ID of the draft',
};

const draftTitleField: INodeProperties = {
	displayName: 'Title',
	name: 'title',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['draft'],
			operation: ['createDraft', 'updateDraft'],
		},
	},
	description: 'Draft title',
};

const draftSubtitleField: INodeProperties = {
	displayName: 'Subtitle',
	name: 'subtitle',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['draft'],
			operation: ['createDraft', 'updateDraft'],
		},
	},
	description: 'Draft subtitle',
};

const draftBodyField: INodeProperties = {
	displayName: 'Body',
	name: 'body',
	type: 'string',
	default: '',
	typeOptions: {
		rows: 8,
	},
	displayOptions: {
		show: {
			resource: ['draft'],
			operation: ['createDraft', 'updateDraft'],
		},
	},
	description: 'Draft body content',
};

const postIdField: INodeProperties = {
	displayName: 'Post ID',
	name: 'postId',
	type: 'number',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['post'],
			operation: ['getPost', 'getPostComments'],
		},
	},
	description: 'The numeric ID of the post',
};

const profileSlugField: INodeProperties = {
	displayName: 'Profile Slug',
	name: 'profileSlug',
	type: 'string',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['profile'],
			operation: ['getProfile', 'getProfileNotes', 'getProfilePosts'],
		},
	},
	description: 'The Substack profile slug or handle',
};

const profileCursorField: INodeProperties = {
	displayName: 'Cursor',
	name: 'cursor',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['profile'],
			operation: ['getProfileNotes'],
		},
	},
	description: 'Pagination cursor returned by a previous notes request',
};

const profileLimitField: INodeProperties = {
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	default: 50,
	typeOptions: {
		minValue: 1,
		maxValue: 100,
		numberPrecision: 0,
	},
	displayOptions: {
		show: {
			resource: ['profile'],
			operation: ['getProfilePosts'],
		},
	},
	description: 'Max number of results to return',
};

const profileOffsetField: INodeProperties = {
	displayName: 'Offset',
	name: 'offset',
	type: 'number',
	default: 0,
	typeOptions: {
		minValue: 0,
		numberPrecision: 0,
	},
	displayOptions: {
		show: {
			resource: ['profile'],
			operation: ['getProfilePosts'],
		},
	},
	description: 'Number of posts to skip',
};

function pushItem(returnData: INodeExecutionData[], itemIndex: number, json: IDataObject) {
	returnData.push({
		json,
		pairedItem: { item: itemIndex },
	});
}

function pushItemsFromResponse(
	returnData: INodeExecutionData[],
	itemIndex: number,
	response: IDataObject,
) {
	const items = Array.isArray(response.items) ? response.items : [];

	for (const item of items) {
		pushItem(returnData, itemIndex, item as IDataObject);
	}
}

function getOptionalString(
	context: IExecuteFunctions,
	name: string,
	itemIndex: number,
): string | undefined {
	const value = String(context.getNodeParameter(name, itemIndex, '')).trim();
	return value === '' ? undefined : value;
}

function getDraftPayload(context: IExecuteFunctions, itemIndex: number): IDataObject {
	return {
		title: getOptionalString(context, 'title', itemIndex) ?? null,
		subtitle: getOptionalString(context, 'subtitle', itemIndex) ?? null,
		body: getOptionalString(context, 'body', itemIndex) ?? null,
	};
}

export class SubstackGateway implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Substack Gateway',
		name: 'substackGateway',
		icon: { light: 'file:substackGateway.svg', dark: 'file:substackGateway.dark.svg' },
		group: ['input'],
		version: [1],
		description: 'Interact with the Substack Gateway API',
		defaults: {
			name: 'Substack Gateway',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'substackGatewayApi',
				required: true,
			},
		],
		properties: [
			resourceOptions,
			ownPublicationOperationOptions,
			notesOperationOptions,
			draftsOperationOptions,
			postsOperationOptions,
			profilesOperationOptions,
			noteIdField,
			noteContentField,
			noteAttachmentField,
			draftIdField,
			draftTitleField,
			draftSubtitleField,
			draftBodyField,
			postIdField,
			profileSlugField,
			profileCursorField,
			profileLimitField,
			profileOffsetField,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('substackGatewayApi');
		const gatewayUrl = String(credentials.gatewayUrl ?? '').replace(/\/+$/, '');

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				const baseRequest = {
					json: true,
				};

				if (resource === 'ownPublication') {
					if (operation === 'ownProfile') {
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/me`,
							},
						)) as IDataObject;

						pushItem(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'ownNotes') {
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/me/notes`,
							},
						)) as IDataObject;

						pushItemsFromResponse(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'ownPosts') {
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/me/posts`,
							},
						)) as IDataObject;

						pushItemsFromResponse(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'ownFollowing') {
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/me/following`,
							},
						)) as IDataObject;

						pushItemsFromResponse(returnData, itemIndex, response);
						continue;
					}
				}

				if (resource === 'note') {
					if (operation === 'createNote') {
						const content = this.getNodeParameter('content', itemIndex) as string;
						const attachment = getOptionalString(this, 'attachment', itemIndex);

						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'POST',
								url: `${gatewayUrl}/notes`,
								body: {
									content,
									...(attachment !== undefined ? { attachment } : {}),
								},
							},
						)) as IDataObject;

						pushItem(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'getNote') {
						const noteId = this.getNodeParameter('noteId', itemIndex) as number;
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/notes/${noteId}`,
							},
						)) as IDataObject;

						pushItem(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'deleteNote') {
						const noteId = this.getNodeParameter('noteId', itemIndex) as number;

						await this.helpers.httpRequestWithAuthentication.call(this, 'substackGatewayApi', {
							...baseRequest,
							method: 'DELETE',
							url: `${gatewayUrl}/notes/${noteId}`,
						});

						pushItem(returnData, itemIndex, { success: true, noteId });
						continue;
					}
				}

				if (resource === 'draft') {
					if (operation === 'listDrafts') {
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/drafts`,
							},
						)) as IDataObject;

						pushItemsFromResponse(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'createDraft') {
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'POST',
								url: `${gatewayUrl}/drafts`,
								body: getDraftPayload(this, itemIndex),
							},
						)) as IDataObject;

						pushItem(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'getDraft') {
						const draftId = this.getNodeParameter('draftId', itemIndex) as number;
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/drafts/${draftId}`,
							},
						)) as IDataObject;

						pushItem(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'updateDraft') {
						const draftId = this.getNodeParameter('draftId', itemIndex) as number;
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'PUT',
								url: `${gatewayUrl}/drafts/${draftId}`,
								body: getDraftPayload(this, itemIndex),
							},
						)) as IDataObject;

						pushItem(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'deleteDraft') {
						const draftId = this.getNodeParameter('draftId', itemIndex) as number;

						await this.helpers.httpRequestWithAuthentication.call(this, 'substackGatewayApi', {
							...baseRequest,
							method: 'DELETE',
							url: `${gatewayUrl}/drafts/${draftId}`,
						});

						pushItem(returnData, itemIndex, { success: true, draftId });
						continue;
					}
				}

				if (resource === 'post') {
					const postId = this.getNodeParameter('postId', itemIndex) as number;

					if (operation === 'getPost') {
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/posts/${postId}`,
							},
						)) as IDataObject;

						pushItem(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'getPostComments') {
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/posts/${postId}/comments`,
							},
						)) as IDataObject;

						pushItemsFromResponse(returnData, itemIndex, response);
						continue;
					}
				}

				if (resource === 'profile') {
					const profileSlug = this.getNodeParameter('profileSlug', itemIndex) as string;

					if (operation === 'getProfile') {
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/profiles/${profileSlug}`,
							},
						)) as IDataObject;

						pushItem(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'getProfileNotes') {
						const cursor = getOptionalString(this, 'cursor', itemIndex);
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/profiles/${profileSlug}/notes`,
								qs: cursor === undefined ? {} : { cursor },
							},
						)) as IDataObject;

						pushItemsFromResponse(returnData, itemIndex, response);
						continue;
					}

					if (operation === 'getProfilePosts') {
						const limit = this.getNodeParameter('limit', itemIndex) as number;
						const offset = this.getNodeParameter('offset', itemIndex) as number;
						const response = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'substackGatewayApi',
							{
								...baseRequest,
								method: 'GET',
								url: `${gatewayUrl}/profiles/${profileSlug}/posts`,
								qs: { limit, offset },
							},
						)) as IDataObject;

						pushItemsFromResponse(returnData, itemIndex, response);
						continue;
					}
				}

				throw new NodeOperationError(
					this.getNode(),
					`Unsupported resource/operation combination: ${resource}/${operation}`,
					{ itemIndex },
				);
			} catch (error) {
				if (this.continueOnFail()) {
					pushItem(returnData, itemIndex, {
						error: error instanceof Error ? error.message : 'Unknown error',
					});
					continue;
				}

				if (error instanceof NodeOperationError) {
					throw error;
				}

				if (typeof error === 'object' && error !== null) {
					throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
				}

				throw new NodeOperationError(this.getNode(), 'Unknown error', { itemIndex });
			}
		}

		return [returnData];
	}
}
