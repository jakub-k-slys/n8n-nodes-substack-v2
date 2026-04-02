import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

const resourceOptions: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	default: 'me',
	options: [
		{
			name: 'Me',
			value: 'me',
		},
	],
};

const meOperationOptions: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	default: 'me',
	displayOptions: {
		show: {
			resource: ['me'],
		},
	},
	options: [
		{
			name: 'Me',
			value: 'me',
			action: 'Get my profile',
			description: 'Get the authenticated user profile from Substack Gateway',
		},
	],
};

export class SubstackGateway implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Substack Gateway',
		name: 'substackGateway',
		icon: { light: 'file:substackGateway.svg', dark: 'file:substackGateway.dark.svg' },
		group: ['input'],
		version: [1],
		description: 'Interact with the Substack Gateway API',
		defaults: {
			name: 'Substack Gateway',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'substackGatewayApi',
				required: true,
			},
		],
		properties: [resourceOptions, meOperationOptions],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('substackGatewayApi');
		const gatewayUrl = String(credentials.gatewayUrl ?? '').replace(/\/+$/, '');
		const gatewayToken = String(credentials.gatewayToken ?? '');

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				if (resource !== 'me' || operation !== 'me') {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported resource/operation combination: ${resource}/${operation}`,
						{ itemIndex },
					);
				}

				const response = (await this.helpers.httpRequest({
					method: 'GET',
					url: `${gatewayUrl}/me`,
					json: true,
					headers: {
						'x-gateway-token': gatewayToken,
					},
				})) as IDataObject;

				returnData.push({
					json: response,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error',
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				if (error instanceof NodeOperationError) {
					throw error;
				}

				throw new NodeOperationError(
					this.getNode(),
					error instanceof Error ? error : new Error('Unknown error'),
					{ itemIndex },
				);
			}
		}

		return [returnData];
	}
}
