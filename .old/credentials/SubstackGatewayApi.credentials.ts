import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SubstackApi implements ICredentialType {
	name = 'substackGatewayApi';
	displayName = 'SubstackGateway API';
	documentationUrl = 'https://github.com/jakub-k-slys/n8n-nodes-substack';
	properties: INodeProperties[] = [
		{
			displayName: 'Publication Address',
			name: 'publicationAddress',
			type: 'string',
			default: '',
			placeholder: 'https://myblog.substack.com',
			description: 'The full URL of your SubstackGateway publication (must include http:// or https://)',
			required: true,
			validateType: 'url',
		},

		{
			displayName: 'Gateway URL',
			name: 'gatewayUrl',
			type: 'string',
			default: 'https://substack-gateway.vercel.app',
			description:
				'Optional SubstackGateway Gateway base URL. Use this when routing requests through a self-hosted gateway.',
			required: false,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			description:
				'Bearer token used by the SubstackGateway Gateway (for example a base64-encoded JSON containing SubstackGateway session cookies)',
			required: true,
		},
	];

	// This allows the credential to be used by other parts of n8n
	// stating how this credential is injected as part of the request
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Cookie: '=substack.sid={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '=https://{{$credentials.publicationAddress}}',
			url: '/api/v1/subscription',
			method: 'GET',
			headers: {
				Cookie: '=substack.sid={{$credentials.apiKey}}',
			},
		},
	};
}
