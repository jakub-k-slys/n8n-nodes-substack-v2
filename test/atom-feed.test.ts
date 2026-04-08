import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Effect } from 'effect';

import {
	parseAtomFeed,
	readAtomFeedCheckpoint,
	selectNewAtomFeedEntries,
	writeAtomFeedCheckpoint,
} from '../nodes/shared/atom-feed/index.ts';

const sampleAtomFeed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>Feed</title>
	<id>feed-id</id>
	<updated>2026-04-08T12:00:00Z</updated>
	<entry>
		<id>entry-2</id>
		<title>Second</title>
		<link href="https://example.com/posts/2" rel="alternate" />
		<updated>2026-04-08T11:00:00Z</updated>
		<published>2026-04-08T10:55:00Z</published>
		<summary>Summary 2</summary>
		<content type="html">&lt;p&gt;Second&lt;/p&gt;</content>
		<author>
			<name>Author 2</name>
		</author>
	</entry>
	<entry>
		<id>entry-1</id>
		<title>First</title>
		<link href="https://example.com/posts/1" />
		<updated>2026-04-08T10:00:00Z</updated>
		<summary>Summary 1</summary>
		<author>
			<name>Author 1</name>
			<uri>https://example.com/@author-1</uri>
		</author>
	</entry>
</feed>`;

describe('Atom feed parsing', () => {
	it('should parse Atom feed entries into normalized items', async () => {
		const parsedFeed = await Effect.runPromise(parseAtomFeed(sampleAtomFeed));

		assert.equal(parsedFeed.title, 'Feed');
		assert.equal(parsedFeed.entries.length, 2);
		assert.deepEqual(parsedFeed.entries[0], {
			id: 'entry-2',
			title: 'Second',
			link: 'https://example.com/posts/2',
			updated: '2026-04-08T11:00:00Z',
			published: '2026-04-08T10:55:00Z',
			summary: 'Summary 2',
			content: '<p>Second</p>',
			author: {
				name: 'Author 2',
				email: undefined,
				uri: undefined,
			},
			raw: parsedFeed.entries[0].raw,
		});
	});
});

describe('Atom feed checkpointing', () => {
	it('should checkpoint the newest timestamp and suppress the first run when requested', async () => {
		const feed = await Effect.runPromise(parseAtomFeed(sampleAtomFeed));
		const firstResult = selectNewAtomFeedEntries({
			entries: feed.entries,
			emitOnlyNewItems: true,
		});

		assert.deepEqual(firstResult.entries, []);
		assert.deepEqual(firstResult.checkpoint, {
			latestTimestamp: Date.parse('2026-04-08T11:00:00Z'),
			latestIds: ['entry-2'],
		});
	});

	it('should return only entries newer than the stored checkpoint', async () => {
		const feed = await Effect.runPromise(parseAtomFeed(sampleAtomFeed));
		const staticData = {};

		writeAtomFeedCheckpoint(staticData, {
			latestTimestamp: Date.parse('2026-04-08T10:00:00Z'),
			latestIds: ['entry-1'],
		});

		const result = selectNewAtomFeedEntries({
			entries: feed.entries,
			emitOnlyNewItems: true,
			checkpoint: readAtomFeedCheckpoint(staticData),
		});

		assert.equal(result.entries.length, 1);
		assert.equal(result.entries[0]?.id, 'entry-2');
	});
});
