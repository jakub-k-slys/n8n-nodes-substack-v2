import { IExecuteFunctions } from 'n8n-workflow';
import { SubstackClient } from './SubstackGatewayClient';
import { SubstackUtils } from '../SubstackUtils';
import { IStandardResponse } from '../types';
import { OperationUtils } from './OperationUtils';

export type OperationExecutor<T> = () => Promise<T>;

export class OperationHandler {
	static async execute<T>(
		executeFunctions: IExecuteFunctions,
		itemIndex: number,
		executor: OperationExecutor<T>,
	): Promise<IStandardResponse> {
		try {
			const data = await executor();
			return this.success(data);
		} catch (error) {
			return SubstackUtils.formatErrorResponse({
				message: (error as Error).message,
				node: executeFunctions.getNode(),
				itemIndex,
			});
		}
	}

	static success<T>(data: T): IStandardResponse {
		return {
			success: true,
			data,
			metadata: {
				status: 'success',
			},
		};
	}

	static getLimit(executeFunctions: IExecuteFunctions, itemIndex: number): number {
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '');
		return OperationUtils.parseLimit(limitParam);
	}

	static async resolveProfile(
		client: SubstackClient,
		slug?: string,
	): Promise<any> {
		if (slug) {
			return client.profileForSlug(slug);
		}
		return client.ownProfile();
	}

	static async collectFromIterable<T, R>(
		iterable: AsyncIterable<T>,
		limit: number,
		formatter: (item: T) => R,
	): Promise<R[]> {
		return OperationUtils.executeAsyncIterable(iterable, limit, formatter);
	}
}
