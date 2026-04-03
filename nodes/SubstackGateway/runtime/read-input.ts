import { Effect, Match } from 'effect';
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

export const readGatewaySelection = readSelection;

export function readGatewayInput(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'OwnPublication' }>,
): Effect.Effect<OwnPublicationInput, GatewayError>;
export function readGatewayInput(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'Note' }>,
): Effect.Effect<NoteInput, GatewayError>;
export function readGatewayInput(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'Draft' }>,
): Effect.Effect<DraftInput, GatewayError>;
export function readGatewayInput(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'Post' }>,
): Effect.Effect<PostInput, GatewayError>;
export function readGatewayInput(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: Extract<GatewayOperation, { readonly _tag: 'Profile' }>,
): Effect.Effect<ProfileInput, GatewayError>;
export function readGatewayInput(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: GatewayOperation,
): Effect.Effect<
	OwnPublicationInput | NoteInput | DraftInput | PostInput | ProfileInput,
	GatewayError
> {
	return Match.value(operation).pipe(
		Match.when({ _tag: 'OwnPublication' }, (operation) =>
			readOwnPublicationInput(context, itemIndex, operation),
		),
		Match.when({ _tag: 'Note' }, (operation) => readNoteInput(context, itemIndex, operation)),
		Match.when({ _tag: 'Draft' }, (operation) => readDraftInput(context, itemIndex, operation)),
		Match.when({ _tag: 'Post' }, (operation) => readPostInput(context, itemIndex, operation)),
		Match.when({ _tag: 'Profile' }, (operation) =>
			readProfileInput(context, itemIndex, operation),
		),
		Match.exhaustive,
	);
}
