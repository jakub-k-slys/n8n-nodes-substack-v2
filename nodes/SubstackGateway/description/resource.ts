import type { INodeProperties } from 'n8n-workflow';

import { getResourceDescription, getStaticDiscoveryResources } from '../domain/operation';

export const resourceProperty: INodeProperties = {
	displayName: 'Resource Name or ID',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	default: 'ownPublication',
	description: 'Choose which Substack Gateway area to work with. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	typeOptions: {
		loadOptionsMethod: 'getGatewayResources',
	},
	options: getStaticDiscoveryResources().map((resource) => ({
		name: resource.name,
		value: resource.resource,
		...(getResourceDescription(resource.resource) === undefined
			? {}
			: { description: getResourceDescription(resource.resource) }),
	})),
};
