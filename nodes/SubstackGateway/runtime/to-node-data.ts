import type { INodeExecutionData } from 'n8n-workflow';

import type { GatewayResult } from '../domain/result';
import { gatewayResultToJsonItems } from './to-json';

export const toNodeExecutionData = (
	itemIndex: number,
	result: GatewayResult,
): INodeExecutionData[] =>
	gatewayResultToJsonItems(result).map((json) => ({
		json,
		pairedItem: { item: itemIndex },
	}));
