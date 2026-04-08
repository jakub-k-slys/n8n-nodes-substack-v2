import type { INodeExecutionData } from 'n8n-workflow';

import type { AtomFeedEntry } from './model';

export const toNodeExecutionData = (
	entries: readonly AtomFeedEntry[],
): INodeExecutionData[] =>
	entries.map((entry) => ({
		json: {
			id: entry.id ?? null,
			title: entry.title ?? null,
			link: entry.link ?? null,
			updated: entry.updated ?? null,
			published: entry.published ?? null,
			author: entry.author ?? null,
			summary: entry.summary ?? null,
			content: entry.content ?? null,
			raw: entry.raw,
		},
	}));
