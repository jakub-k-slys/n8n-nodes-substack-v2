import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SubstackGatewayApi } from '../../dist/credentials/SubstackGatewayApi.credentials.js';
import { SubstackGatewayFollowingFeed } from '../../dist/nodes/SubstackGatewayFollowingFeed/SubstackGatewayFollowingFeed.node.js';
import { SubstackGatewayProfileFeed } from '../../dist/nodes/SubstackGatewayProfileFeed/SubstackGatewayProfileFeed.node.js';
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
		const node = new SubstackGatewayFollowingFeed();

		assert.equal(node.description.name, 'substackGatewayFollowingFeed');
		assert.equal(node.description.displayName, 'Substack Gateway Following Feed');
		assert.equal(node.description.polling, true);
	});

	it('should expose the built profile feed trigger metadata', () => {
		const node = new SubstackGatewayProfileFeed();

		assert.equal(node.description.name, 'substackGatewayProfileFeed');
		assert.equal(node.description.displayName, 'Substack Gateway Profile Feed');
		assert.equal(node.description.polling, true);
	});
});
