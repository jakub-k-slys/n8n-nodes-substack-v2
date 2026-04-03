import * as HttpClient from '@effect/platform/HttpClient';
import { Either, Effect } from 'effect';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import type { GatewayError } from '../../../domain/error';
import type { PostOperation } from '../../../domain/operation';
import type { GatewayUrl } from '../../../schema';
import { decodeGatewayOperation } from '../../decode-operation';
import { executeGatewayRequest } from '../../execute-request';
import { toNodeExecutionData } from '../../to-node-data';
import { buildPostRequest } from './build';
import { decodePostCommand } from './decode';
import { decodePostResponse } from './decode-response';
import { readPostInput } from './read-input';

const fromEither = <A>(result: Either.Either<A, GatewayError>): Effect.Effect<A, GatewayError> =>
	Either.isRight(result) ? Effect.succeed(result.right) : Effect.fail(result.left);

const decodePostOperation = (operation: string): Effect.Effect<PostOperation, GatewayError> =>
	Effect.flatMap(fromEither(decodeGatewayOperation('post', operation)), (decoded) =>
		decoded._tag === 'Post'
			? Effect.succeed(decoded.operation)
			: Effect.fail({
					_tag: 'UnsupportedOperation',
					resource: 'post',
					operation,
				} satisfies GatewayError),
	);

export const executePostOperation = (
	context: IExecuteFunctions,
	itemIndex: number,
	gatewayUrl: GatewayUrl,
	operation: string,
): Effect.Effect<INodeExecutionData[], GatewayError, HttpClient.HttpClient> =>
	Effect.gen(function* () {
		const postOperation = yield* decodePostOperation(operation);
		const input = yield* readPostInput(context, itemIndex, {
			_tag: 'Post',
			operation: postOperation,
		});
		const command = yield* fromEither(decodePostCommand(input));
		yield* Effect.logDebug('Decoded post command').pipe(
			Effect.annotateLogs({
				itemIndex,
				operation: command._tag,
			}),
		);

		const request = buildPostRequest(gatewayUrl, command);
		yield* Effect.logDebug('Built post request').pipe(
			Effect.annotateLogs({
				itemIndex,
				operation: command._tag,
				method: request.method,
				url: request.url,
			}),
		);

		const rawResponse = yield* executeGatewayRequest(request);
		const result = yield* fromEither(decodePostResponse(command, rawResponse));
		yield* Effect.logDebug('Decoded post response').pipe(
			Effect.annotateLogs({
				itemIndex,
				resultType: result.result._tag,
			}),
		);

		return toNodeExecutionData(itemIndex, result);
	});
