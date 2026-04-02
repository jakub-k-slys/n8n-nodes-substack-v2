export type GatewayResource = 'ownPublication' | 'note' | 'draft' | 'post' | 'profile';

export type OwnPublicationOperation = 'ownProfile' | 'ownNotes' | 'ownPosts' | 'ownFollowing';

export type NoteOperation = 'createNote' | 'getNote' | 'deleteNote';

export type DraftOperation =
	| 'listDrafts'
	| 'createDraft'
	| 'getDraft'
	| 'updateDraft'
	| 'deleteDraft';

export type PostOperation = 'getPost' | 'getPostComments';

export type ProfileOperation = 'getProfile' | 'getProfileNotes' | 'getProfilePosts';

export type GatewayOperation =
	| { readonly _tag: 'OwnPublication'; readonly operation: OwnPublicationOperation }
	| { readonly _tag: 'Note'; readonly operation: NoteOperation }
	| { readonly _tag: 'Draft'; readonly operation: DraftOperation }
	| { readonly _tag: 'Post'; readonly operation: PostOperation }
	| { readonly _tag: 'Profile'; readonly operation: ProfileOperation };
