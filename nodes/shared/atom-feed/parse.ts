import { XMLParser } from 'fast-xml-parser';
import { Effect } from 'effect';

import type { AtomFeed, AtomFeedAuthor, AtomFeedEntry } from './model';

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '',
	removeNSPrefix: true,
	parseTagValue: false,
	trimValues: true,
	textNodeName: '#text',
});

const asArray = <Value>(value: Value | readonly Value[] | undefined): readonly Value[] =>
	value === undefined ? [] : Array.isArray(value) ? value : [value];

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
	typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: undefined;

const readText = (value: unknown): string | undefined => {
	if (typeof value === 'string') {
		return value;
	}

	if (typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}

	if (Array.isArray(value)) {
		for (const item of value) {
			const text = readText(item);

			if (text !== undefined) {
				return text;
			}
		}

		return undefined;
	}

	const record = asRecord(value);

	if (record === undefined) {
		return undefined;
	}

	return readText(record['#text']);
};

const readLinkHref = (value: unknown): string | undefined => {
	const links = asArray(value)
		.map(asRecord)
		.filter((link): link is Record<string, unknown> => link !== undefined);
	const preferredLink =
		links.find((link) => {
			const rel = typeof link.rel === 'string' ? link.rel : undefined;

			return rel === undefined || rel === 'alternate';
		}) ?? links[0];

	return preferredLink !== undefined && typeof preferredLink.href === 'string'
		? preferredLink.href
		: undefined;
};

const readAuthor = (value: unknown): AtomFeedAuthor | undefined => {
	const author = asRecord(Array.isArray(value) ? value[0] : value);

	if (author === undefined) {
		return undefined;
	}

	const normalizedAuthor = {
		name: readText(author.name),
		email: readText(author.email),
		uri: readText(author.uri),
	} satisfies AtomFeedAuthor;

	return Object.values(normalizedAuthor).some((entry) => entry !== undefined)
		? normalizedAuthor
		: undefined;
};

const toEntry = (value: unknown): AtomFeedEntry | undefined => {
	const entry = asRecord(value);

	if (entry === undefined) {
		return undefined;
	}

	return {
		id: readText(entry.id),
		title: readText(entry.title),
		link: readLinkHref(entry.link),
		updated: readText(entry.updated),
		published: readText(entry.published),
		summary: readText(entry.summary),
		author: readAuthor(entry.author),
	};
};

const toAtomFeed = (document: unknown): AtomFeed => {
	const feed = asRecord(asRecord(document)?.feed);

	if (feed === undefined) {
		throw new Error('Invalid Atom feed: missing <feed> root element');
	}

	return {
		title: readText(feed.title),
		id: readText(feed.id),
		updated: readText(feed.updated),
		entries: asArray(feed.entry)
			.map(toEntry)
			.filter((entry): entry is AtomFeedEntry => entry !== undefined),
	};
};

export const parseAtomFeed = (xml: string): Effect.Effect<AtomFeed, Error> =>
	Effect.try({
		try: () => toAtomFeed(xmlParser.parse(xml)),
		catch: (cause) =>
			cause instanceof Error ? cause : new Error('Failed to parse Atom feed', { cause }),
	});
