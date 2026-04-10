import type { INodeProperties } from 'n8n-workflow';

export const noteFields: INodeProperties[] = [
	{
		displayName: 'Note ID',
		name: 'noteId',
		type: 'number',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['deleteNote', 'getNote', 'likeNote', 'unlikeNote'],
			},
		},
		description: 'The numeric ID of the note',
	},
	{
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
	},
	{
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
	},
];
