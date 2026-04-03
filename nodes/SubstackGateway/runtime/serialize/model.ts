import type { IDataObject } from 'n8n-workflow';
import * as Schema from 'effect/Schema';

import type {
	CreatedDraft,
	CreatedNote,
	DeletedDraft,
	DeletedNote,
	GatewayComment,
	GatewayDraft,
	GatewayDraftSummary,
	GatewayFollowingUser,
	GatewayNote,
	GatewayNoteAuthor,
	GatewayPost,
	GatewayPostSummary,
	GatewayProfile,
} from '../../domain/model';
import { optional } from './shared';

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

const encodeJson = <A>(schema: Schema.Schema<A>) => Schema.encodeSync(schema);

export const toJsonNoteAuthor = (author: GatewayNoteAuthor): IDataObject => ({
	...encodeJson(JsonNoteAuthorSchema)(author),
});

export const toJsonProfile = (profile: GatewayProfile): IDataObject => ({
	id: profile.id,
	handle: profile.handle,
	name: profile.name,
	url: profile.url,
	avatarUrl: profile.avatarUrl,
	...optional('bio', profile.bio),
});

export const toJsonFollowingUser = (user: GatewayFollowingUser): IDataObject => ({
	id: user.id,
	handle: user.handle,
});

export const toJsonNote = (note: GatewayNote): IDataObject => ({
	...encodeJson(JsonNoteSchema)({
		...note,
		author: encodeJson(JsonNoteAuthorSchema)(note.author),
	}),
});

export const toJsonPostSummary = (post: GatewayPostSummary): IDataObject => ({
	id: post.id,
	title: post.title,
	publishedAt: post.publishedAt,
	...optional('subtitle', post.subtitle),
	...optional('truncatedBody', post.truncatedBody),
});

export const toJsonPost = (post: GatewayPost): IDataObject => ({
	id: post.id,
	title: post.title,
	slug: post.slug,
	url: post.url,
	publishedAt: post.publishedAt,
	...optional('subtitle', post.subtitle),
	...optional('htmlBody', post.htmlBody),
	...optional('markdown', post.markdown),
	...optional('truncatedBody', post.truncatedBody),
	...optional('reactions', post.reactions),
	...optional('restacks', post.restacks),
	...optional('tags', post.tags),
	...optional('coverImage', post.coverImage),
});

export const toJsonDraft = (draft: GatewayDraft): IDataObject => ({
	...optional('title', draft.title),
	...optional('subtitle', draft.subtitle),
	...optional('body', draft.body),
});

export const toJsonDraftSummary = (draft: GatewayDraftSummary): IDataObject => ({
	id: draft.id,
	uuid: draft.uuid,
	...optional('title', draft.title),
	...optional('updated', draft.updated),
});

export const toJsonComment = (comment: GatewayComment): IDataObject => ({
	id: comment.id,
	body: comment.body,
	isAdmin: comment.isAdmin,
});

export const toJsonCreatedNote = (note: CreatedNote): IDataObject => ({
	...encodeJson(JsonCreatedNoteSchema)(note),
});

export const toJsonCreatedDraft = (draft: CreatedDraft): IDataObject => ({
	id: draft.id,
	uuid: draft.uuid,
});

export const toJsonDeletedNote = (note: DeletedNote): IDataObject => ({
	...encodeJson(JsonDeletedNoteSchema)(note),
});

export const toJsonDeletedDraft = (draft: DeletedDraft): IDataObject => ({
	success: draft.success,
	draftId: draft.draftId,
});
