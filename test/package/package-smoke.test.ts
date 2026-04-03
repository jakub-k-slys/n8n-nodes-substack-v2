import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SubstackGatewayApi } from '../../dist/credentials/SubstackGatewayApi.credentials.js';
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
});
