import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { Either } = require('effect');
const { decodeGatewayOperation } = require('../dist/nodes/SubstackGateway/runtime/decode-operation.js');

test('decodeGatewayOperation decodes supported resource operations', () => {
	const result = decodeGatewayOperation('profile', 'getProfilePosts');

	assert.equal(Either.isRight(result), true);
	assert.deepEqual(result.right, {
		_tag: 'Profile',
		operation: 'getProfilePosts',
	});
});

test('decodeGatewayOperation rejects unsupported combinations', () => {
	const result = decodeGatewayOperation('note', 'getProfile');

	assert.equal(Either.isLeft(result), true);
	assert.deepEqual(result.left, {
		_tag: 'UnsupportedOperation',
		resource: 'note',
		operation: 'getProfile',
	});
});
