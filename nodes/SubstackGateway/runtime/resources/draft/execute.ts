import * as HttpClient from '@effect/platform/HttpClient';
import { Either, Effect } from 'effect';
import type { INodeExecutionData } from 'n8n-workflow';

import type { GatewayError } from '../../../domain/error';
import type { DraftOperation } from '../../../domain/operation';
import type { GatewayUrl } from '../../../schema';
import { decodeGatewayOperation } from '../../decode-operation';
import { executeGatewayRequest } from '../../execute-request';
import { NodeInput } from '../../node-input';
import { toNodeExecutionData } from '../../to-node-data';
import { buildDraftRequest } from './build';
import { decodeDraftCommand } from './decode';
import { decodeDraftResponse } from './decode-response';

const fromEither = <A>(result: Either.Either<A, GatewayError>): Effect.Effect<A, GatewayError> =>
	Either.isRight(result) ? Effect.succeed(result.right) : Effect.fail(result.left);

const decodeDraftOperation = (operation: string): Effect.Effect<DraftOperation, GatewayError> =>
	Effect.flatMap(fromEither(decodeGatewayOperation('draft', operation)), (decoded) =>
		decoded._tag === 'Draft'
			? Effect.succeed(decoded.operation)
			: Effect.fail({
					_tag: 'UnsupportedOperation',
					resource: 'draft',
					operation,
				} satisfies GatewayError),
	);

export const executeDraftOperation = (
	itemIndex: number,
	gatewayUrl: GatewayUrl,
	operation: string,
): Effect.Effect<INodeExecutionData[], GatewayError, HttpClient.HttpClient | NodeInput> =>
	Effect.gen(function* () {
		const draftOperation = yield* decodeDraftOperation(operation);
		const nodeInput = yield* NodeInput;
		const input = yield* nodeInput.getDraftInput({
			_tag: 'Draft',
			operation: draftOperation,
		});
		const command = yield* fromEither(decodeDraftCommand(input));
		yield* Effect.logDebug('Decoded draft command').pipe(
			Effect.annotateLogs({
				itemIndex,
				operation: command._tag,
			}),
		);

		const request = buildDraftRequest(gatewayUrl, command);
		yield* Effect.logDebug('Built draft request').pipe(
			Effect.annotateLogs({
				itemIndex,
				operation: command._tag,
				method: request.method,
				url: request.url,
			}),
		);

		const rawResponse = yield* executeGatewayRequest(request);
		const result = yield* fromEither(decodeDraftResponse(command, rawResponse));
		yield* Effect.logDebug('Decoded draft response').pipe(
			Effect.annotateLogs({
				itemIndex,
				resultType: result.result._tag,
			}),
		);

		return toNodeExecutionData(itemIndex, result);
	});
