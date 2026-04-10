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
	GatewayPost,
	GatewayPostSummary,
	GatewayProfile,
	LikedNote,
	LikedPost,
} from './model';

export type OwnPublicationResult =
	| { readonly _tag: 'Profile'; readonly item: GatewayProfile }
	| { readonly _tag: 'Notes'; readonly items: ReadonlyArray<GatewayNote> }
	| { readonly _tag: 'Posts'; readonly items: ReadonlyArray<GatewayPostSummary> }
	| { readonly _tag: 'Following'; readonly items: ReadonlyArray<GatewayFollowingUser> };

export type NoteResult =
	| { readonly _tag: 'Created'; readonly item: CreatedNote }
	| { readonly _tag: 'Fetched'; readonly item: GatewayNote }
	| { readonly _tag: 'Deleted'; readonly item: DeletedNote }
	| { readonly _tag: 'Liked'; readonly item: LikedNote }
	| { readonly _tag: 'Unliked'; readonly item: LikedNote };

export type DraftResult =
	| { readonly _tag: 'List'; readonly items: ReadonlyArray<GatewayDraftSummary> }
	| { readonly _tag: 'Created'; readonly item: CreatedDraft }
	| { readonly _tag: 'Fetched'; readonly item: GatewayDraft }
	| { readonly _tag: 'Updated'; readonly item: GatewayDraft }
	| { readonly _tag: 'Deleted'; readonly item: DeletedDraft };

export type PostResult =
	| { readonly _tag: 'Fetched'; readonly item: GatewayPost }
	| { readonly _tag: 'Comments'; readonly items: ReadonlyArray<GatewayComment> }
	| { readonly _tag: 'Liked'; readonly item: LikedPost }
	| { readonly _tag: 'Unliked'; readonly item: LikedPost };

export type ProfileResult =
	| { readonly _tag: 'Fetched'; readonly item: GatewayProfile }
	| { readonly _tag: 'Notes'; readonly items: ReadonlyArray<GatewayNote> }
	| { readonly _tag: 'Posts'; readonly items: ReadonlyArray<GatewayPostSummary> };

export type GatewayResult =
	| { readonly _tag: 'OwnPublication'; readonly result: OwnPublicationResult }
	| { readonly _tag: 'Note'; readonly result: NoteResult }
	| { readonly _tag: 'Draft'; readonly result: DraftResult }
	| { readonly _tag: 'Post'; readonly result: PostResult }
	| { readonly _tag: 'Profile'; readonly result: ProfileResult };
