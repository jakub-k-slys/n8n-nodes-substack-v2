export type GatewayProfile = {
	readonly id: number;
	readonly handle: string;
	readonly name: string;
	readonly url: string;
	readonly avatarUrl: string;
	readonly bio?: string | null;
};

export type GatewayFollowingUser = {
	readonly id: number;
	readonly handle: string;
};

export type GatewayNoteAuthor = {
	readonly id: number;
	readonly name: string;
	readonly handle: string;
	readonly avatarUrl: string;
};

export type GatewayNote = {
	readonly id: number;
	readonly body: string;
	readonly likesCount: number;
	readonly author: GatewayNoteAuthor;
	readonly publishedAt: string;
};

export type GatewayPostSummary = {
	readonly id: number;
	readonly title: string;
	readonly subtitle?: string | null;
	readonly truncatedBody?: string | null;
	readonly publishedAt: string;
};

export type GatewayPost = {
	readonly id: number;
	readonly title: string;
	readonly slug: string;
	readonly url: string;
	readonly publishedAt: string;
	readonly subtitle?: string | null;
	readonly htmlBody?: string | null;
	readonly markdown?: string | null;
	readonly truncatedBody?: string | null;
	readonly reactions?: Record<string, number> | null;
	readonly restacks?: number | null;
	readonly tags?: ReadonlyArray<string> | null;
	readonly coverImage?: string | null;
};

export type GatewayDraft = {
	readonly title?: string | null;
	readonly subtitle?: string | null;
	readonly body?: string | null;
};

export type GatewayDraftSummary = {
	readonly id: number;
	readonly uuid: string;
	readonly title?: string | null;
	readonly updated?: string | null;
};

export type GatewayComment = {
	readonly id: number;
	readonly body: string;
	readonly isAdmin: boolean;
};

export type CreatedNote = {
	readonly id: number;
};

export type CreatedDraft = {
	readonly id: number;
	readonly uuid: string;
};

export type LikedNote = {
	readonly success: boolean;
	readonly noteId: number;
	readonly liked: boolean;
};

export type DeletedNote = {
	readonly success: boolean;
	readonly noteId: number;
};

export type LikedPost = {
	readonly success: boolean;
	readonly postId: number;
	readonly liked: boolean;
};

export type DeletedDraft = {
	readonly success: boolean;
	readonly draftId: number;
};
