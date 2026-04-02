import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { gatewayResultToJsonItems } = require('../dist/nodes/SubstackGateway/runtime/to-json.js');

test('gatewayResultToJsonItems serializes note results explicitly', () => {
	const items = gatewayResultToJsonItems({
		_tag: 'Note',
		result: {
			_tag: 'Fetched',
			item: {
				id: 1,
				body: 'Hello',
				likesCount: 3,
				author: {
					id: 2,
					name: 'Jakub',
					handle: 'jakub',
					avatarUrl: 'https://cdn.example/avatar.png',
				},
				publishedAt: '2026-04-02T12:00:00.000Z',
			},
		},
	});

	assert.deepEqual(items, [
		{
			id: 1,
			body: 'Hello',
			likesCount: 3,
			author: {
				id: 2,
				name: 'Jakub',
				handle: 'jakub',
				avatarUrl: 'https://cdn.example/avatar.png',
			},
			publishedAt: '2026-04-02T12:00:00.000Z',
		},
	]);
});

test('gatewayResultToJsonItems omits undefined optional fields', () => {
	const items = gatewayResultToJsonItems({
		_tag: 'OwnPublication',
		result: {
			_tag: 'Profile',
			item: {
				id: 1,
				handle: 'substack',
				name: 'Substack',
				url: 'https://substack.com',
				avatarUrl: 'https://cdn.example/avatar.png',
			},
		},
	});

	assert.deepEqual(items, [
		{
			id: 1,
			handle: 'substack',
			name: 'Substack',
			url: 'https://substack.com',
			avatarUrl: 'https://cdn.example/avatar.png',
		},
	]);
});
