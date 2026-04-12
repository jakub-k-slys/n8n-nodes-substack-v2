import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	buildGatewayOperation,
	getOperationDescription,
	getRequiredFeatureForOperation,
} from '../nodes/SubstackGateway/domain/operation.ts';

describe('gateway capabilities metadata', () => {
	it('should not require a feature for OSS-supported operations', () => {
		assert.equal(
			getRequiredFeatureForOperation(buildGatewayOperation('note', 'createNote')),
			undefined,
		);
	});

	it('should require a feature for gated operations', () => {
		assert.equal(
			getRequiredFeatureForOperation(buildGatewayOperation('draft', 'createDraft')),
			'api:drafts:create',
		);
	});

	it('should annotate gated operations in the editor description', () => {
		assert.equal(
			getOperationDescription('post', 'likePost'),
			'Requires gateway feature support and is not available in OSS',
		);
	});
});
