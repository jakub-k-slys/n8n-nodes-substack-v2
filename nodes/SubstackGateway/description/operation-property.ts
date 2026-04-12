import type { INodeProperties } from 'n8n-workflow';

import {
	gatewayResourceCatalogByResource,
	getOperationDescription,
	getStaticDiscoveryOperations,
	type GatewayResource,
} from '../domain/operation';

export const createOperationProperty = <Resource extends GatewayResource>(
	resource: Resource,
): INodeProperties => {
	const definition = gatewayResourceCatalogByResource[resource];
	const staticOperations = getStaticDiscoveryOperations(resource);
	const fallbackOperations =
		staticOperations.length > 0
			? staticOperations
			: definition.operations.filter((operation) => operation.value === definition.defaultOperation);

	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	return {
		displayName: 'Operation Name or ID',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: definition.defaultOperation,
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: [resource],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getGatewayOperations',
			loadOptionsDependsOn: ['resource'],
		},
		options: fallbackOperations.map((operation) => ({
			name: operation.name,
			value: operation.value,
			action: operation.action,
			...(getOperationDescription(resource, operation.value) === undefined
				? {}
				: { description: getOperationDescription(resource, operation.value) }),
		})),
	};
};
