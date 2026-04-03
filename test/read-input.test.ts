import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Effect, Match } from 'effect';

import { decodeGatewayOperation } from '../nodes/SubstackGateway/runtime/decode-operation.ts';
import { makeNodeInputLayer } from '../nodes/SubstackGateway/runtime/live/node-input.ts';
import { NodeInput } from '../nodes/SubstackGateway/runtime/node-input.ts';

type TestContext = {
	getNodeParameter: (name: string, itemIndex?: number, fallback?: unknown) => unknown;
};

const createContext = (parameters: Record<string, unknown>): TestContext => ({
	getNodeParameter: (name, _itemIndex, fallback) => (name in parameters ? parameters[name] : fallback),
});

describe('readGatewayInput', () => {
	const readInput = (parameters: Record<string, unknown>, resource: string, operation: string) => {
		const typedOperation = decodeGatewayOperation(resource, operation);
		assert.equal(typedOperation._tag, 'Right');

		return Effect.runPromise(
			Effect.flatMap(NodeInput, (nodeInput) =>
				Match.value(typedOperation.right).pipe(
					Match.when({ _tag: 'OwnPublication' }, (typedOperation) =>
						nodeInput.getOwnPublicationInput(typedOperation),
					),
					Match.when({ _tag: 'Note' }, (typedOperation) => nodeInput.getNoteInput(typedOperation)),
					Match.when({ _tag: 'Draft' }, (typedOperation) => nodeInput.getDraftInput(typedOperation)),
					Match.when({ _tag: 'Post' }, (typedOperation) => nodeInput.getPostInput(typedOperation)),
					Match.when({ _tag: 'Profile' }, (typedOperation) =>
						nodeInput.getProfileInput(typedOperation),
					),
					Match.exhaustive,
				),
			).pipe(Effect.provide(makeNodeInputLayer(createContext(parameters) as never, 0))),
		);
	};

	it('should read resource and operation as strings', async () => {
		const selection = await Effect.runPromise(
			Effect.flatMap(NodeInput, (nodeInput) => nodeInput.getSelection).pipe(
				Effect.provide(
					makeNodeInputLayer(
						createContext({
							resource: 'draft',
							operation: 'createDraft',
						}) as never,
						0,
					),
				),
			),
		);

		assert.deepEqual(selection, {
			_tag: 'Draft',
			operation: 'createDraft',
		});
	});

	it('should read typed note creation input', async () => {
		const input = await readInput(
			{
				content: 'hello',
				attachment: 'https://example.com/file.png',
			},
			'note',
			'createNote',
		);

		assert.deepEqual(input, {
			_tag: 'createNote',
			content: 'hello',
			attachment: 'https://example.com/file.png',
		});
	});

	it('should normalize blank optional strings', async () => {
		const input = await readInput(
			{
				profileSlug: 'substack',
				cursor: '   ',
			},
			'profile',
			'getProfileNotes',
		);

		assert.deepEqual(input, {
			_tag: 'getProfileNotes',
			profileSlug: 'substack',
		});
	});
});
