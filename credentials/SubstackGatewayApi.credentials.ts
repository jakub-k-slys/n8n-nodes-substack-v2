import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SubstackGatewayApi implements ICredentialType {
	name = 'substackGatewayApi';

	displayName = 'Substack Gateway';

	icon = {
		light: 'file:../nodes/SubstackGateway/substackGateway.svg',
		dark: 'file:../nodes/SubstackGateway/substackGateway.dark.svg',
	} as const;

	documentationUrl = 'https://github.com/org/repo?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Gateway URL',
			name: 'gatewayUrl',
			type: 'string',
			required: true,
			default: 'https://substack-gateway.vercel.app/api/v1',
			placeholder: 'https://substack-gateway.vercel.app/api/v1',
		},
		{
			displayName: 'Gateway Token',
			name: 'gatewayToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-gateway-token': '={{$credentials.gatewayToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.gatewayUrl}}',
			url: '/health/ready',
			method: 'GET',
			headers: {
				'x-gateway-token': '={{$credentials.gatewayToken}}',
			},
		},
	};
}
