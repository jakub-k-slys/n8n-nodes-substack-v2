import type { INodeProperties } from 'n8n-workflow';

import {
	getOperationDescription,
	gatewayResourceCatalogByResource,
	type GatewayResource,
} from '../domain/operation';

export const createOperationProperty = <Resource extends GatewayResource>(
	resource: Resource,
): INodeProperties => {
	const definition = gatewayResourceCatalogByResource[resource];

	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: definition.defaultOperation,
		displayOptions: {
			show: {
				resource: [resource],
			},
		},
		options: definition.operations.map((operation) => ({
			name: operation.name,
			value: operation.value,
			action: operation.action,
			...(getOperationDescription(resource, operation.value) === undefined
				? {}
				: { description: getOperationDescription(resource, operation.value) }),
		})),
	};
};
