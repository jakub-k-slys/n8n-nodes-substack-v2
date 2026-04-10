import type {
	CommentResponse,
	CreateDraftResponse,
	CreateNoteResponse,
	DraftResponse,
	DraftSummaryResponse,
	FollowingUserResponse,
	FullPostResponse,
	NoteAuthor,
	NoteResponse,
	PostResponse,
	ProfileResponse,
} from '../../schema';
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
	LikedNote,
	LikedPost,
} from '../../domain/model';

export const toGatewayProfile = (profile: ProfileResponse): GatewayProfile => ({
	id: profile.id,
	handle: profile.handle,
	name: profile.name,
	url: profile.url,
	avatarUrl: profile.avatar_url,
	...(profile.bio !== undefined ? { bio: profile.bio } : {}),
});

export const toGatewayFollowingUser = (user: FollowingUserResponse): GatewayFollowingUser => ({
	id: user.id,
	handle: user.handle,
});

export const toGatewayNoteAuthor = (author: NoteAuthor): GatewayNoteAuthor => ({
	id: author.id,
	name: author.name,
	handle: author.handle,
	avatarUrl: author.avatar_url,
});

export const toGatewayNote = (note: NoteResponse): GatewayNote => ({
	id: note.id,
	body: note.body,
	likesCount: note.likes_count,
	author: toGatewayNoteAuthor(note.author),
	publishedAt: note.published_at,
});

export const toGatewayPostSummary = (post: PostResponse): GatewayPostSummary => ({
	id: post.id,
	title: post.title,
	subtitle: post.subtitle,
	truncatedBody: post.truncated_body,
	publishedAt: post.published_at,
});

export const toGatewayPost = (post: FullPostResponse): GatewayPost => ({
	id: post.id,
	title: post.title,
	slug: post.slug,
	url: post.url,
	publishedAt: post.published_at,
	subtitle: post.subtitle,
	htmlBody: post.html_body,
	markdown: post.markdown,
	truncatedBody: post.truncated_body,
	reactions: post.reactions,
	restacks: post.restacks,
	tags: post.tags,
	coverImage: post.cover_image,
});

export const toGatewayDraft = (draft: DraftResponse): GatewayDraft => ({
	title: draft.title,
	subtitle: draft.subtitle,
	body: draft.body,
});

export const toGatewayDraftSummary = (draft: DraftSummaryResponse): GatewayDraftSummary => ({
	id: draft.id,
	uuid: draft.uuid,
	title: draft.title,
	updated: draft.updated,
});

export const toGatewayComment = (comment: CommentResponse): GatewayComment => ({
	id: comment.id,
	body: comment.body,
	isAdmin: comment.is_admin,
});

export const toCreatedNote = (note: CreateNoteResponse): CreatedNote => ({
	id: note.id,
});

export const toCreatedDraft = (draft: CreateDraftResponse): CreatedDraft => ({
	id: draft.id,
	uuid: draft.uuid,
});

export const toDeletedNote = (note: DeletedNote): DeletedNote => note;

export const toLikedNote = (note: LikedNote): LikedNote => note;

export const toDeletedDraft = (draft: DeletedDraft): DeletedDraft => draft;

export const toLikedPost = (post: LikedPost): LikedPost => post;
