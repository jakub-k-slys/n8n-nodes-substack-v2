import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SubstackGatewayApi } from '../../dist/credentials/SubstackGatewayApi.credentials.js';
import { FollowingFeed } from '../../dist/nodes/SubstackGateway/FollowingFeed.node.js';
import { Gateway } from '../../dist/nodes/SubstackGateway/Gateway.node.js';
import { ProfileFeed } from '../../dist/nodes/SubstackGateway/ProfileFeed.node.js';
import { Randomizer } from '../../dist/nodes/Randomizer/Randomizer.node.js';

describe('package build smoke', () => {
	it('should expose the built node metadata', () => {
		const node = new Gateway();

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
		const node = new FollowingFeed();

		assert.equal(node.description.name, 'substackGatewayFollowingFeed');
		assert.equal(node.description.displayName, 'Substack Gateway Following Feed');
		assert.equal(node.description.polling, true);
		assert.equal(node.description.properties[0]?.name, 'emitOnlyNewItems');
		assert.equal(node.description.properties[1]?.name, 'options');
	});

	it('should expose the built profile feed trigger metadata', () => {
		const node = new ProfileFeed();

		assert.equal(node.description.name, 'substackGatewayProfileFeed');
		assert.equal(node.description.displayName, 'Substack Gateway Profile Feed');
		assert.equal(node.description.polling, true);
	});

	it('should expose the built randomizer trigger metadata', () => {
		const node = new Randomizer();

		assert.equal(node.description.name, 'randomizer');
		assert.equal(node.description.displayName, 'Randomizer');
		assert.equal(node.description.polling, undefined);
		assert.equal(node.description.properties[0]?.name, 'schedules');
	});
});
