import * as Schema from 'effect/Schema';

import { CreateNoteResponseSchema, NoteResponseSchema } from './common';

export const NoteGetResponseSchema = NoteResponseSchema;

export const NoteCreateResponseSchema = CreateNoteResponseSchema;

export const NoteDeleteResponseSchema = Schema.Struct({
	success: Schema.Boolean,
	noteId: Schema.Number,
});

export const NoteLikeResponseSchema = Schema.Struct({
	success: Schema.Boolean,
	noteId: Schema.Number,
	liked: Schema.Boolean,
});
