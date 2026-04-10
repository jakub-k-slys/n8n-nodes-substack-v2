import type { IDataObject } from 'n8n-workflow';
import * as Schema from 'effect/Schema';

import type { GatewayComment, GatewayPost, LikedPost } from '../../../domain/model';
import { encodeJson, optional } from '../../serialize/shared';

const JsonPostSchema = Schema.Struct({
	id: Schema.Number,
	title: Schema.String,
	slug: Schema.String,
	url: Schema.String,
	publishedAt: Schema.String,
	subtitle: Schema.optional(Schema.NullOr(Schema.String)),
	htmlBody: Schema.optional(Schema.NullOr(Schema.String)),
	markdown: Schema.optional(Schema.NullOr(Schema.String)),
	truncatedBody: Schema.optional(Schema.NullOr(Schema.String)),
	reactions: Schema.optional(
		Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Number })),
	),
	restacks: Schema.optional(Schema.NullOr(Schema.Number)),
	tags: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
	coverImage: Schema.optional(Schema.NullOr(Schema.String)),
});

const JsonCommentSchema = Schema.Struct({
	id: Schema.Number,
	body: Schema.String,
	isAdmin: Schema.Boolean,
});

const JsonLikedPostSchema = Schema.Struct({
	success: Schema.Boolean,
	postId: Schema.Number,
	liked: Schema.Boolean,
});

export const toJsonPost = (post: GatewayPost): IDataObject => ({
	...encodeJson(JsonPostSchema)({
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
	}),
});

export const toJsonComment = (comment: GatewayComment): IDataObject => ({
	...encodeJson(JsonCommentSchema)(comment),
});

export const toJsonLikedPost = (post: LikedPost): IDataObject => ({
	...encodeJson(JsonLikedPostSchema)(post),
});
