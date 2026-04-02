import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { Effect } = require('effect');
const { readGatewayInput, readGatewaySelection } = require('../dist/nodes/SubstackGateway/runtime/read-input.js');

const createContext = (parameters) => ({
	getNodeParameter: (name, _itemIndex, fallback) => (name in parameters ? parameters[name] : fallback),
});

test('readGatewaySelection reads resource and operation as strings', async () => {
	const selection = await Effect.runPromise(
		readGatewaySelection(
			createContext({
				resource: 'draft',
				operation: 'createDraft',
			}),
			0,
		),
	);

	assert.deepEqual(selection, {
		resource: 'draft',
		operation: 'createDraft',
	});
});

test('readGatewayInput reads typed note creation input', async () => {
	const input = await Effect.runPromise(
		readGatewayInput(
			createContext({
				content: 'hello',
				attachment: 'https://example.com/file.png',
			}),
			0,
			{
				_tag: 'Note',
				operation: 'createNote',
			},
		),
	);

	assert.deepEqual(input, {
		_tag: 'createNote',
		content: 'hello',
		attachment: 'https://example.com/file.png',
	});
});

test('readGatewayInput normalizes blank optional strings', async () => {
	const input = await Effect.runPromise(
		readGatewayInput(
			createContext({
				profileSlug: 'substack',
				cursor: '   ',
			}),
			0,
			{
				_tag: 'Profile',
				operation: 'getProfileNotes',
			},
		),
	);

	assert.deepEqual(input, {
		_tag: 'getProfileNotes',
		profileSlug: 'substack',
		cursor: undefined,
	});
});
