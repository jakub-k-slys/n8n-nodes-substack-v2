import type { INodeProperties } from 'n8n-workflow';

import { getStaticDiscoveryResources } from '../domain/operation';

export const resourceProperty: INodeProperties = {
	displayName: 'Resource Name or ID',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	default: 'ownPublication',
	description:
		'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	typeOptions: {
		loadOptionsMethod: 'getGatewayResources',
	},
	options: getStaticDiscoveryResources().map((resource) => ({
		name: resource.name,
		value: resource.resource,
	})),
};
