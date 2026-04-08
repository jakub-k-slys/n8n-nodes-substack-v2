import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SubstackGatewayApi } from '../../dist/credentials/SubstackGatewayApi.credentials.js';
import { SubstackFollowingFeedTrigger } from '../../dist/nodes/SubstackFollowingFeedTrigger/SubstackFollowingFeedTrigger.node.js';
import { SubstackProfileFeedTrigger } from '../../dist/nodes/SubstackProfileFeedTrigger/SubstackProfileFeedTrigger.node.js';
import { SubstackGateway } from '../../dist/nodes/SubstackGateway/SubstackGateway.node.js';

describe('package build smoke', () => {
	it('should expose the built node metadata', () => {
		const node = new SubstackGateway();

		assert.equal(node.description.name, 'substackGateway');
		assert.equal(node.description.displayName, 'Substack Gateway');
		assert.deepEqual(node.description.credentials, [
			{
				name: 'substackGatewayApi',
				required: true,
			},
		]);
	});

	it('should expose the built credential metadata', () => {
		const credential = new SubstackGatewayApi();

		assert.equal(credential.name, 'substackGatewayApi');
		assert.equal(credential.displayName, 'Substack Gateway API');
		assert.equal(credential.properties[0]?.name, 'gatewayUrl');
		assert.equal(credential.properties[1]?.name, 'gatewayToken');
	});

	it('should expose the built following feed trigger metadata', () => {
		const node = new SubstackFollowingFeedTrigger();

		assert.equal(node.description.name, 'substackFollowingFeedTrigger');
		assert.equal(node.description.displayName, 'Following Feed Trigger');
		assert.equal(node.description.polling, true);
	});

	it('should expose the built profile feed trigger metadata', () => {
		const node = new SubstackProfileFeedTrigger();

		assert.equal(node.description.name, 'substackProfileFeedTrigger');
		assert.equal(node.description.displayName, 'Profile Feed Trigger');
		assert.equal(node.description.polling, true);
	});
});
