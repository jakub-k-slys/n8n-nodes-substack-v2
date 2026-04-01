import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from './shared/SubstackGatewayClient';
import { IStandardResponse } from './types';
import { SubstackUtils } from './SubstackUtils';
import { DataFormatters } from './shared/DataFormatters';
import { OperationUtils } from './shared/OperationUtils';
import { OperationHandler } from './shared/OperationHandler';

export enum NoteOperation {
	Create = 'create',
	Get = 'get',
	GetNotesBySlug = 'getNotesBySlug',
	GetNoteById = 'getNoteById',
}

export const noteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['note'],
			},
		},
		options: [
			{
				name: 'Create Note',
				value: NoteOperation.Create,
				description: 'Create a new SubstackGateway note',
				action: 'Create note',
			},
			{
				name: 'Get Notes',
				value: NoteOperation.Get,
				description: 'Get notes from own profile',
				action: 'Get notes',
			},
			{
				name: 'Get Notes From Profile by Slug',
				value: NoteOperation.GetNotesBySlug,
				description: 'Get notes from a profile by its publication slug',
				action: 'Get notes by slug',
			},
			{
				name: 'Get Note by ID',
				value: NoteOperation.GetNoteById,
				description: 'Get a specific note by its ID',
				action: 'Get note by ID',
			},
		],
	},
];

async function get(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	return OperationHandler.execute(executeFunctions, itemIndex, async () => {
		const limit = OperationHandler.getLimit(executeFunctions, itemIndex);
		const profile = await OperationHandler.resolveProfile(client);
		return OperationHandler.collectFromIterable(profile.notes(), limit, (note) =>
			DataFormatters.formatNote(note, publicationAddress),
		);
	});
}

async function getNotesBySlug(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	return OperationHandler.execute(executeFunctions, itemIndex, async () => {
		const slug = executeFunctions.getNodeParameter('slug', itemIndex) as string;
		const limit = OperationHandler.getLimit(executeFunctions, itemIndex);
		const profile = await OperationHandler.resolveProfile(client, slug);
		return OperationHandler.collectFromIterable(profile.notes(), limit, (note) =>
			DataFormatters.formatNote(note, publicationAddress),
		);
	});
}

async function getNoteById(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	return OperationHandler.execute(executeFunctions, itemIndex, async () => {
		const noteId = OperationUtils.parseNumericParam(
			executeFunctions.getNodeParameter('noteId', itemIndex),
			'noteId',
		);

		const note = await client.noteForId(noteId);
		return DataFormatters.formatNote(note, publicationAddress);
	});
}

async function create(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	return OperationHandler.execute(executeFunctions, itemIndex, async () => {
		const body = executeFunctions.getNodeParameter('body', itemIndex) as string;
		const visibility = executeFunctions.getNodeParameter(
			'visibility',
			itemIndex,
			'everyone',
		) as string;
		const attachment = executeFunctions.getNodeParameter('attachment', itemIndex, 'none') as string;
		const linkUrl =
			attachment === 'link'
				? (executeFunctions.getNodeParameter('linkUrl', itemIndex) as string)
				: undefined;

		if (!body || !body.trim()) {
			throw new Error(
				'Note must contain at least one paragraph with content - body cannot be empty',
			);
		}

		const ownProfile = await client.ownProfile();
		const response = await ownProfile.publishNote(
			body.trim(),
			linkUrl ? { attachment: linkUrl } : undefined,
		);

		return {
			success: true,
			noteId: response.id.toString(),
			body: body.trim(),
			url: SubstackUtils.formatUrl(publicationAddress, `/p/${response.id}`),
			date: new Date().toISOString(),
			status: 'published',
			visibility,
			attachment,
			linkUrl,
		};
	});
}

export const noteOperationHandlers: Record<
	NoteOperation,
	(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) => Promise<IStandardResponse>
> = {
	[NoteOperation.Create]: create,
	[NoteOperation.Get]: get,
	[NoteOperation.GetNotesBySlug]: getNotesBySlug,
	[NoteOperation.GetNoteById]: getNoteById,
};
