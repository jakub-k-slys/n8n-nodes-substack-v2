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
import { readDraftInput } from './read-input/draft';
import { readNoteInput } from './read-input/note';
import { readOwnPublicationInput } from './read-input/own-publication';
import { readPostInput } from './read-input/post';
import { readProfileInput } from './read-input/profile';
import { readSelection } from './read-input/shared';

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
