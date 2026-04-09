import type { IDataObject } from 'n8n-workflow';

import type { AtomFeedCheckpoint, AtomFeedEntry } from './model';

const LATEST_TIMESTAMP_KEY = 'atomFeedLatestTimestamp';
const LATEST_IDS_KEY = 'atomFeedLatestIds';

const getEntryIdentity = (entry: AtomFeedEntry): string =>
	entry.id ??
	entry.link ??
	`${entry.updated ?? entry.published ?? '0'}:${entry.title ?? ''}:${entry.summary ?? ''}`;

const getEntryTimestamp = (entry: AtomFeedEntry): number => {
	const candidate = entry.updated ?? entry.published;

	if (candidate === undefined) {
		return 0;
	}

	const parsed = Date.parse(candidate);

	return Number.isNaN(parsed) ? 0 : parsed;
};

const sortEntriesAscending = (entries: readonly AtomFeedEntry[]): AtomFeedEntry[] =>
	[...entries].sort((left, right) => {
		const timestampOrder = getEntryTimestamp(left) - getEntryTimestamp(right);

		if (timestampOrder !== 0) {
			return timestampOrder;
		}

		return getEntryIdentity(left).localeCompare(getEntryIdentity(right));
	});

const dedupeEntries = (entries: readonly AtomFeedEntry[]): AtomFeedEntry[] => {
	const identities = new Set<string>();

	return sortEntriesAscending(entries).filter((entry) => {
		const identity = getEntryIdentity(entry);

		if (identities.has(identity)) {
			return false;
		}

		identities.add(identity);
		return true;
	});
};

export const readAtomFeedCheckpoint = (
	staticData: IDataObject,
): AtomFeedCheckpoint | undefined => {
	const latestTimestamp = staticData[LATEST_TIMESTAMP_KEY];
	const latestIds = staticData[LATEST_IDS_KEY];

	if (typeof latestTimestamp !== 'number' || !Array.isArray(latestIds)) {
		return undefined;
	}

	return {
		latestTimestamp,
		latestIds: latestIds.filter((value): value is string => typeof value === 'string'),
	};
};

export const writeAtomFeedCheckpoint = (
	staticData: IDataObject,
	checkpoint: AtomFeedCheckpoint,
): void => {
	staticData[LATEST_TIMESTAMP_KEY] = checkpoint.latestTimestamp;
	staticData[LATEST_IDS_KEY] = [...checkpoint.latestIds];
};

export const selectNewAtomFeedEntries = ({
	entries,
	checkpoint,
	emitOnlyNewItems,
}: {
	readonly entries: readonly AtomFeedEntry[];
	readonly checkpoint?: AtomFeedCheckpoint;
	readonly emitOnlyNewItems: boolean;
}): {
	readonly entries: readonly AtomFeedEntry[];
	readonly checkpoint?: AtomFeedCheckpoint;
} => {
	const normalizedEntries = dedupeEntries(entries);

	if (normalizedEntries.length === 0) {
		return {
			entries: [],
			checkpoint,
		};
	}

	const latestTimestamp = getEntryTimestamp(normalizedEntries[normalizedEntries.length - 1]);
	const latestIds = normalizedEntries
		.filter((entry) => getEntryTimestamp(entry) === latestTimestamp)
		.map(getEntryIdentity);
	const nextCheckpoint = {
		latestTimestamp,
		latestIds,
	} satisfies AtomFeedCheckpoint;

	if (checkpoint === undefined) {
		return {
			entries: emitOnlyNewItems ? [] : normalizedEntries,
			checkpoint: nextCheckpoint,
		};
	}

	return {
		entries: normalizedEntries.filter((entry) => {
			const timestamp = getEntryTimestamp(entry);

			if (timestamp > checkpoint.latestTimestamp) {
				return true;
			}

			if (timestamp < checkpoint.latestTimestamp) {
				return false;
			}

			return !checkpoint.latestIds.includes(getEntryIdentity(entry));
		}),
		checkpoint: nextCheckpoint,
	};
};
