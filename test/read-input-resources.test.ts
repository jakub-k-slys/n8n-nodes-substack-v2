import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Effect } from 'effect';

import { readDraftInput } from '../dist/nodes/SubstackGateway/runtime/resources/draft/read-input.js';
import { readNoteInput } from '../dist/nodes/SubstackGateway/runtime/resources/note/read-input.js';
import { readOwnPublicationInput } from '../dist/nodes/SubstackGateway/runtime/resources/own-publication/read-input.js';
import { readPostInput } from '../dist/nodes/SubstackGateway/runtime/resources/post/read-input.js';
import { readProfileInput } from '../dist/nodes/SubstackGateway/runtime/resources/profile/read-input.js';

type TestContext = {
	getNodeParameter: (name: string, itemIndex?: number, fallback?: unknown) => unknown;
};

const createContext = (parameters: Record<string, unknown>): TestContext => ({
	getNodeParameter: (name, _itemIndex, fallback) => (name in parameters ? parameters[name] : fallback),
});

describe('resource input readers', () => {
	it('should read own publication passthrough input', async () => {
		const input = await Effect.runPromise(
			readOwnPublicationInput(createContext({}) as never, 0, {
				_tag: 'OwnPublication',
				operation: 'ownFollowing',
			}),
		);

		assert.deepEqual(input, { _tag: 'ownFollowing' });
	});

	it('should read note get parameters', async () => {
		const input = await Effect.runPromise(
			readNoteInput(createContext({ noteId: 42 }) as never, 0, {
				_tag: 'Note',
				operation: 'getNote',
			}),
		);

		assert.deepEqual(input, {
			_tag: 'getNote',
			noteId: 42,
		});
	});

	it('should read draft update payloads', async () => {
		const input = await Effect.runPromise(
			readDraftInput(
				createContext({
					draftId: 7,
					title: 'Hello',
					subtitle: '',
					body: 'World',
				}) as never,
				0,
				{ _tag: 'Draft', operation: 'updateDraft' },
			),
		);

		assert.deepEqual(input, {
			_tag: 'updateDraft',
			draftId: 7,
			title: 'Hello',
			subtitle: null,
			body: 'World',
		});
	});

	it('should read post comment operations', async () => {
		const input = await Effect.runPromise(
			readPostInput(createContext({ postId: 99 }) as never, 0, {
				_tag: 'Post',
				operation: 'getPostComments',
			}),
		);

		assert.deepEqual(input, {
			_tag: 'getPostComments',
			postId: 99,
		});
	});

	it('should read profile post pagination', async () => {
		const input = await Effect.runPromise(
			readProfileInput(
				createContext({
					profileSlug: 'substack',
					limit: 10,
					offset: 20,
				}) as never,
				0,
				{ _tag: 'Profile', operation: 'getProfilePosts' },
			),
		);

		assert.deepEqual(input, {
			_tag: 'getProfilePosts',
			profileSlug: 'substack',
			limit: 10,
			offset: 20,
		});
	});
});
