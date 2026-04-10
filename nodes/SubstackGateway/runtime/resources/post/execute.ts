import * as HttpClient from '@effect/platform/HttpClient';
import { Effect } from 'effect';

import type { GatewayError } from '../../../domain/error';
import type { GatewayResult } from '../../../domain/result';
import type { GatewayUrl } from '../../../schema';
import { NodeInput } from '../../node-input';
import { decodeTaggedOperation, executeResourceOperation, fromEither } from '../../resource-executor';
import { buildPostRequest } from './build';
import { decodePostCommand } from './decode';
import { decodePostResponse } from './decode-response';

export const executePostOperation = (
	itemIndex: number,
	gatewayUrl: GatewayUrl,
	operation: string,
): Effect.Effect<GatewayResult, GatewayError, HttpClient.HttpClient | NodeInput> =>
	executeResourceOperation({
		itemIndex,
		gatewayUrl,
		operation,
		logLabel: 'post',
		decodeOperation: (operation) =>
			decodeTaggedOperation<'getPost' | 'getPostComments' | 'likePost' | 'unlikePost'>(
				'post',
				'Post',
				operation,
			),
		readInput: (nodeInput, operation) =>
			nodeInput.getPostInput({
				_tag: 'Post',
				operation,
			}),
		decodeCommand: (input) => fromEither(decodePostCommand(input)),
		buildRequest: buildPostRequest,
		decodeResponse: (command, rawResponse) => fromEither(decodePostResponse(command, rawResponse)),
	});
