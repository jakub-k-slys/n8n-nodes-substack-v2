import type { IDataObject } from 'n8n-workflow';
import * as Schema from 'effect/Schema';

import type {
	CreatedNote,
	DeletedNote,
	GatewayNote,
	GatewayNoteAuthor,
	LikedNote,
} from '../../../domain/model';
import { encodeJson } from '../../serialize/shared';

const JsonNoteAuthorSchema = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	handle: Schema.String,
	avatarUrl: Schema.String,
});

const JsonNoteSchema = Schema.Struct({
	id: Schema.Number,
	body: Schema.String,
	likesCount: Schema.Number,
	author: JsonNoteAuthorSchema,
	publishedAt: Schema.String,
});

const JsonCreatedNoteSchema = Schema.Struct({
	id: Schema.Number,
});

const JsonDeletedNoteSchema = Schema.Struct({
	success: Schema.Boolean,
	noteId: Schema.Number,
});

const JsonLikedNoteSchema = Schema.Struct({
	success: Schema.Boolean,
	noteId: Schema.Number,
	liked: Schema.Boolean,
});

export const toJsonNoteAuthor = (author: GatewayNoteAuthor): IDataObject => ({
	...encodeJson(JsonNoteAuthorSchema)(author),
});

export const toJsonNote = (note: GatewayNote): IDataObject => ({
	...encodeJson(JsonNoteSchema)({
		...note,
		author: encodeJson(JsonNoteAuthorSchema)(note.author),
	}),
});

export const toJsonCreatedNote = (note: CreatedNote): IDataObject => ({
	...encodeJson(JsonCreatedNoteSchema)(note),
});

export const toJsonDeletedNote = (note: DeletedNote): IDataObject => ({
	...encodeJson(JsonDeletedNoteSchema)(note),
});

export const toJsonLikedNote = (note: LikedNote): IDataObject => ({
	...encodeJson(JsonLikedNoteSchema)(note),
});
