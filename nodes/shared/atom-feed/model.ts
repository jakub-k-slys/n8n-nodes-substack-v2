export type AtomFeedAuthor = {
	readonly name?: string;
	readonly email?: string;
	readonly uri?: string;
};

export type AtomFeedEntry = {
	readonly id?: string;
	readonly title?: string;
	readonly link?: string;
	readonly updated?: string;
	readonly published?: string;
	readonly summary?: string;
	readonly author?: AtomFeedAuthor;
};

export type AtomFeed = {
	readonly title?: string;
	readonly id?: string;
	readonly updated?: string;
	readonly entries: readonly AtomFeedEntry[];
};

export type AtomFeedCheckpoint = {
	readonly latestTimestamp: number;
	readonly latestIds: readonly string[];
};
