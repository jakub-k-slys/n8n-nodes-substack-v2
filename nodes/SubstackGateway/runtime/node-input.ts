import { Context, Effect, Layer } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { GatewayError } from '../domain/error';
import type {
	DraftInput,
	NoteInput,
	OwnPublicationInput,
	PostInput,
	ProfileInput,
} from '../domain/input';
import type { GatewayOperation } from '../domain/operation';
import { readSelection } from './read-input/shared';
import { readDraftInput } from './resources/draft/read-input';
import { readNoteInput } from './resources/note/read-input';
import { readOwnPublicationInput } from './resources/own-publication/read-input';
import { readPostInput } from './resources/post/read-input';
import { readProfileInput } from './resources/profile/read-input';

export type GatewaySelection = {
	readonly resource: string;
	readonly operation: string;
};

export type NodeInput = {
	readonly getSelection: Effect.Effect<GatewaySelection, GatewayError>;
	readonly getOwnPublicationInput: (
		operation: Extract<GatewayOperation, { readonly _tag: 'OwnPublication' }>,
	) => Effect.Effect<OwnPublicationInput, GatewayError>;
	readonly getNoteInput: (
		operation: Extract<GatewayOperation, { readonly _tag: 'Note' }>,
	) => Effect.Effect<NoteInput, GatewayError>;
	readonly getDraftInput: (
		operation: Extract<GatewayOperation, { readonly _tag: 'Draft' }>,
	) => Effect.Effect<DraftInput, GatewayError>;
	readonly getPostInput: (
		operation: Extract<GatewayOperation, { readonly _tag: 'Post' }>,
	) => Effect.Effect<PostInput, GatewayError>;
	readonly getProfileInput: (
		operation: Extract<GatewayOperation, { readonly _tag: 'Profile' }>,
	) => Effect.Effect<ProfileInput, GatewayError>;
};

export const NodeInput = Context.GenericTag<NodeInput>('NodeInput');

export const makeNodeInputLayer = (context: IExecuteFunctions, itemIndex: number) =>
	Layer.succeed(NodeInput, {
		getSelection: readSelection(context, itemIndex),
		getOwnPublicationInput: (operation) => readOwnPublicationInput(context, itemIndex, operation),
		getNoteInput: (operation) => readNoteInput(context, itemIndex, operation),
		getDraftInput: (operation) => readDraftInput(context, itemIndex, operation),
		getPostInput: (operation) => readPostInput(context, itemIndex, operation),
		getProfileInput: (operation) => readProfileInput(context, itemIndex, operation),
	});
