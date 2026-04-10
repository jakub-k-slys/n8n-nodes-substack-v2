import type {
	OwnPublicationOperation,
} from './operation';

export type OwnPublicationInput = {
	readonly _tag: OwnPublicationOperation;
};

export type NoteInput =
	| { readonly _tag: 'createNote'; readonly content: unknown; readonly attachment?: string }
	| { readonly _tag: 'getNote'; readonly noteId: unknown }
	| { readonly _tag: 'deleteNote'; readonly noteId: unknown }
	| { readonly _tag: 'likeNote'; readonly noteId: unknown }
	| { readonly _tag: 'unlikeNote'; readonly noteId: unknown };

export type DraftInput =
	| { readonly _tag: 'listDrafts' }
	| {
			readonly _tag: 'createDraft';
			readonly title: string | null;
			readonly subtitle: string | null;
			readonly body: string | null;
	  }
	| { readonly _tag: 'getDraft'; readonly draftId: unknown }
	| {
			readonly _tag: 'updateDraft';
			readonly draftId: unknown;
			readonly title: string | null;
			readonly subtitle: string | null;
			readonly body: string | null;
	  }
	| { readonly _tag: 'deleteDraft'; readonly draftId: unknown };

export type PostInput =
	| { readonly _tag: 'getPost'; readonly postId: unknown }
	| { readonly _tag: 'getPostComments'; readonly postId: unknown }
	| { readonly _tag: 'likePost'; readonly postId: unknown }
	| { readonly _tag: 'unlikePost'; readonly postId: unknown };

export type ProfileInput =
	| { readonly _tag: 'getProfile'; readonly profileSlug: unknown }
	| {
			readonly _tag: 'getProfileNotes';
			readonly profileSlug: unknown;
			readonly cursor?: string;
	  }
	| {
			readonly _tag: 'getProfilePosts';
			readonly profileSlug: unknown;
			readonly limit: unknown;
			readonly offset: unknown;
	  };
