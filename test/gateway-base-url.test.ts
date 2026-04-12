import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	toGatewayApiBaseUrl,
	toGatewayRootUrl,
} from '../nodes/shared/gateway-transport/index.ts';

describe('toGatewayApiBaseUrl', () => {
	it('should normalize the root gateway URL', () => {
		assert.equal(
			toGatewayRootUrl('https://substack-gateway.example/api/v1/'),
			'https://substack-gateway.example',
		);
	});

	it('should append the API version path to a root gateway URL', () => {
		assert.equal(
			toGatewayApiBaseUrl('https://substack-gateway.example'),
			'https://substack-gateway.example/api/v1',
		);
	});

	it('should keep existing saved api/v1 credentials valid', () => {
		assert.equal(
			toGatewayApiBaseUrl('https://substack-gateway.example/api/v1/'),
			'https://substack-gateway.example/api/v1',
		);
	});
});
