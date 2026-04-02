import { Match } from 'effect';
import type { IDataObject } from 'n8n-workflow';

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
} from '../domain/model';
import type { GatewayResult } from '../domain/result';

const optional = <T>(key: string, value: T | undefined): Record<string, T> =>
	value === undefined ? {} : { [key]: value };

const toJsonNoteAuthor = (author: GatewayNoteAuthor): IDataObject => ({
	id: author.id,
	name: author.name,
	handle: author.handle,
	avatarUrl: author.avatarUrl,
});

const toJsonProfile = (profile: GatewayProfile): IDataObject => ({
	id: profile.id,
	handle: profile.handle,
	name: profile.name,
	url: profile.url,
	avatarUrl: profile.avatarUrl,
	...optional('bio', profile.bio),
});

const toJsonFollowingUser = (user: GatewayFollowingUser): IDataObject => ({
	id: user.id,
	handle: user.handle,
});

const toJsonNote = (note: GatewayNote): IDataObject => ({
	id: note.id,
	body: note.body,
	likesCount: note.likesCount,
	author: toJsonNoteAuthor(note.author),
	publishedAt: note.publishedAt,
});

const toJsonPostSummary = (post: GatewayPostSummary): IDataObject => ({
	id: post.id,
	title: post.title,
	publishedAt: post.publishedAt,
	...optional('subtitle', post.subtitle),
	...optional('truncatedBody', post.truncatedBody),
});

const toJsonPost = (post: GatewayPost): IDataObject => ({
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

const toJsonDraft = (draft: GatewayDraft): IDataObject => ({
	...optional('title', draft.title),
	...optional('subtitle', draft.subtitle),
	...optional('body', draft.body),
});

const toJsonDraftSummary = (draft: GatewayDraftSummary): IDataObject => ({
	id: draft.id,
	uuid: draft.uuid,
	...optional('title', draft.title),
	...optional('updated', draft.updated),
});

const toJsonComment = (comment: GatewayComment): IDataObject => ({
	id: comment.id,
	body: comment.body,
	isAdmin: comment.isAdmin,
});

const toJsonCreatedNote = (note: CreatedNote): IDataObject => ({
	id: note.id,
});

const toJsonCreatedDraft = (draft: CreatedDraft): IDataObject => ({
	id: draft.id,
	uuid: draft.uuid,
});

const toJsonDeletedNote = (note: DeletedNote): IDataObject => ({
	success: note.success,
	noteId: note.noteId,
});

const toJsonDeletedDraft = (draft: DeletedDraft): IDataObject => ({
	success: draft.success,
	draftId: draft.draftId,
});

const ownPublicationToJson = (result: GatewayResult & { readonly _tag: 'OwnPublication' }) =>
	Match.value(result.result).pipe(
		Match.when({ _tag: 'Profile' }, ({ item }) => [toJsonProfile(item)]),
		Match.when({ _tag: 'Notes' }, ({ items }) => items.map(toJsonNote)),
		Match.when({ _tag: 'Posts' }, ({ items }) => items.map(toJsonPostSummary)),
		Match.when({ _tag: 'Following' }, ({ items }) => items.map(toJsonFollowingUser)),
		Match.exhaustive,
	);

const noteToJson = (result: GatewayResult & { readonly _tag: 'Note' }) =>
	Match.value(result.result).pipe(
		Match.when({ _tag: 'Created' }, ({ item }) => [toJsonCreatedNote(item)]),
		Match.when({ _tag: 'Fetched' }, ({ item }) => [toJsonNote(item)]),
		Match.when({ _tag: 'Deleted' }, ({ item }) => [toJsonDeletedNote(item)]),
		Match.exhaustive,
	);

const draftToJson = (result: GatewayResult & { readonly _tag: 'Draft' }) =>
	Match.value(result.result).pipe(
		Match.when({ _tag: 'List' }, ({ items }) => items.map(toJsonDraftSummary)),
		Match.when({ _tag: 'Created' }, ({ item }) => [toJsonCreatedDraft(item)]),
		Match.when({ _tag: 'Fetched' }, ({ item }) => [toJsonDraft(item)]),
		Match.when({ _tag: 'Updated' }, ({ item }) => [toJsonDraft(item)]),
		Match.when({ _tag: 'Deleted' }, ({ item }) => [toJsonDeletedDraft(item)]),
		Match.exhaustive,
	);

const postToJson = (result: GatewayResult & { readonly _tag: 'Post' }) =>
	Match.value(result.result).pipe(
		Match.when({ _tag: 'Fetched' }, ({ item }) => [toJsonPost(item)]),
		Match.when({ _tag: 'Comments' }, ({ items }) => items.map(toJsonComment)),
		Match.exhaustive,
	);

const profileToJson = (result: GatewayResult & { readonly _tag: 'Profile' }) =>
	Match.value(result.result).pipe(
		Match.when({ _tag: 'Fetched' }, ({ item }) => [toJsonProfile(item)]),
		Match.when({ _tag: 'Notes' }, ({ items }) => items.map(toJsonNote)),
		Match.when({ _tag: 'Posts' }, ({ items }) => items.map(toJsonPostSummary)),
		Match.exhaustive,
	);

export const gatewayResultToJsonItems = (result: GatewayResult): ReadonlyArray<IDataObject> =>
	Match.value(result).pipe(
		Match.when({ _tag: 'OwnPublication' }, ownPublicationToJson),
		Match.when({ _tag: 'Note' }, noteToJson),
		Match.when({ _tag: 'Draft' }, draftToJson),
		Match.when({ _tag: 'Post' }, postToJson),
		Match.when({ _tag: 'Profile' }, profileToJson),
		Match.exhaustive,
	);
