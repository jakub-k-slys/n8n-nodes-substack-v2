import { Context, Effect } from 'effect';

import type { GatewayError } from '../domain/error';
import type {
	DraftInput,
	NoteInput,
	OwnPublicationInput,
	PostInput,
	ProfileInput,
} from '../domain/input';
import type { GatewayOperation } from '../domain/operation';

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
