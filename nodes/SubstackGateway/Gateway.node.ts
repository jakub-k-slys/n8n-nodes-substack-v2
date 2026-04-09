import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { Either } from 'effect';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { substackGatewayProperties } from './description';
import {
	isUnsupportedOperationError,
	toGatewayApiCause,
	toGatewayErrorMessage,
} from './domain/error';
import { GatewayUrlSchema } from './schema';
import { decodeInput } from './runtime/decode/shared';
import { runGatewayOperation } from './runtime/execute';

export class Gateway implements INodeType {
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
		properties: substackGatewayProperties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('substackGatewayApi');
		const decodedGatewayUrl = decodeInput(
			GatewayUrlSchema,
			String(credentials.gatewayUrl ?? '').replace(/\/+$/, ''),
		);

		if (Either.isLeft(decodedGatewayUrl)) {
			throw new NodeOperationError(this.getNode(), 'Invalid Gateway URL credential');
		}

		const gatewayUrl = decodedGatewayUrl.right;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				returnData.push(...(await runGatewayOperation(this, itemIndex, gatewayUrl)));
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: toGatewayErrorMessage(error),
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				if (error instanceof NodeOperationError) {
					throw error;
				}

				if (isUnsupportedOperationError(error)) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported resource/operation combination: ${error.resource}/${error.operation}`,
						{ itemIndex },
					);
				}

				const apiCause = toGatewayApiCause(error);

				if (apiCause !== undefined) {
					throw new NodeApiError(this.getNode(), apiCause, { itemIndex });
				}

				throw new NodeOperationError(this.getNode(), 'Unknown error', { itemIndex });
			}
		}

		return [returnData];
	}
}
