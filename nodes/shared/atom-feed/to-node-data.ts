import type { INodeExecutionData } from 'n8n-workflow';

import type { AtomFeedEntry } from './model';

const parseStructuredEntryId = (
	entryId: string | undefined,
): {
	readonly id: number | string | null;
	readonly type: string | null;
} => {
	if (entryId === undefined) {
		return {
			id: null,
			type: null,
		};
	}

	const [type, rawId, ...rest] = entryId.split(':');

	if (rawId === undefined || rest.length > 0 || type.length === 0 || rawId.length === 0) {
		return {
			id: entryId,
			type: null,
		};
	}

	return {
		id: /^\d+$/.test(rawId) ? Number(rawId) : rawId,
		type,
	};
};

const toCanonicalLink = (
	entry: AtomFeedEntry,
	structuredEntryId: {
		readonly id: number | string | null;
		readonly type: string | null;
	},
): string | undefined => {
	if (structuredEntryId.type === 'note' && structuredEntryId.id !== null) {
		const authorUri = entry.author?.uri?.replace(/\/+$/, '');

		if (authorUri !== undefined && authorUri.length > 0) {
			return `${authorUri}/note/c-${structuredEntryId.id}`;
		}
	}

	return entry.link;
};

export const toNodeExecutionData = (
	entries: readonly AtomFeedEntry[],
): INodeExecutionData[] =>
	entries.map((entry) => {
		const structuredEntryId = parseStructuredEntryId(entry.id);
		const canonicalLink = toCanonicalLink(entry, structuredEntryId);
		const json = {
			...(structuredEntryId.id === null ? {} : { id: structuredEntryId.id }),
			...(structuredEntryId.type === null ? {} : { type: structuredEntryId.type }),
			...(entry.title === undefined ? {} : { title: entry.title }),
			...(canonicalLink === undefined ? {} : { link: canonicalLink }),
			...(entry.updated === undefined ? {} : { updated: entry.updated }),
			...(entry.published === undefined ? {} : { published: entry.published }),
			...(entry.author === undefined ? {} : { author: entry.author }),
			...(entry.summary === undefined ? {} : { summary: entry.summary }),
		};

		return {
			json,
		};
	});
