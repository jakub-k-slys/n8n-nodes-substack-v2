import type {
	Cursor,
	DraftId,
	Limit,
	NoteId,
	Offset,
	PostId,
	ProfileSlug,
} from '../schema';

export type OwnPublicationCommand =
	| { readonly _tag: 'OwnProfile' }
	| { readonly _tag: 'OwnNotes' }
	| { readonly _tag: 'OwnPosts' }
	| { readonly _tag: 'OwnFollowing' };

export type NoteCommand =
	| { readonly _tag: 'Create'; readonly content: string; readonly attachment?: string }
	| { readonly _tag: 'Get'; readonly noteId: NoteId }
	| { readonly _tag: 'Delete'; readonly noteId: NoteId }
	| { readonly _tag: 'Like'; readonly noteId: NoteId }
	| { readonly _tag: 'Unlike'; readonly noteId: NoteId };

export type DraftCommand =
	| { readonly _tag: 'List' }
	| {
			readonly _tag: 'Create';
			readonly title: string | null;
			readonly subtitle: string | null;
			readonly body: string | null;
	  }
	| { readonly _tag: 'Get'; readonly draftId: DraftId }
	| {
			readonly _tag: 'Update';
			readonly draftId: DraftId;
			readonly title: string | null;
			readonly subtitle: string | null;
			readonly body: string | null;
	  }
	| { readonly _tag: 'Delete'; readonly draftId: DraftId };

export type PostCommand =
	| { readonly _tag: 'Get'; readonly postId: PostId }
	| { readonly _tag: 'GetComments'; readonly postId: PostId }
	| { readonly _tag: 'Like'; readonly postId: PostId }
	| { readonly _tag: 'Unlike'; readonly postId: PostId };

export type ProfileCommand =
	| { readonly _tag: 'Get'; readonly profileSlug: ProfileSlug }
	| { readonly _tag: 'GetNotes'; readonly profileSlug: ProfileSlug; readonly cursor?: Cursor }
	| {
			readonly _tag: 'GetPosts';
			readonly profileSlug: ProfileSlug;
			readonly limit: Limit;
			readonly offset: Offset;
	  };

export type GatewayCommand =
	| { readonly _tag: 'OwnPublication'; readonly command: OwnPublicationCommand }
	| { readonly _tag: 'Note'; readonly command: NoteCommand }
	| { readonly _tag: 'Draft'; readonly command: DraftCommand }
	| { readonly _tag: 'Post'; readonly command: PostCommand }
	| { readonly _tag: 'Profile'; readonly command: ProfileCommand };
