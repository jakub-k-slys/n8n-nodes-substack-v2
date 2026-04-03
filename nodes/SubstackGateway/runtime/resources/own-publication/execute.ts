import * as HttpClient from '@effect/platform/HttpClient';
import { Either, Effect } from 'effect';

import type { GatewayError } from '../../../domain/error';
import type { OwnPublicationOperation } from '../../../domain/operation';
import type { GatewayResult } from '../../../domain/result';
import type { GatewayUrl } from '../../../schema';
import { decodeGatewayOperation } from '../../decode-operation';
import { executeGatewayRequest } from '../../execute-request';
import { NodeInput } from '../../node-input';
import { buildOwnPublicationRequest } from './build';
import { decodeOwnPublicationCommand } from './decode';
import { decodeOwnPublicationResponse } from './decode-response';

const fromEither = <A>(result: Either.Either<A, GatewayError>): Effect.Effect<A, GatewayError> =>
	Either.isRight(result) ? Effect.succeed(result.right) : Effect.fail(result.left);

const decodeOwnPublicationOperation = (
	operation: string,
): Effect.Effect<OwnPublicationOperation, GatewayError> =>
	Effect.flatMap(fromEither(decodeGatewayOperation('ownPublication', operation)), (decoded) =>
		decoded._tag === 'OwnPublication'
			? Effect.succeed(decoded.operation)
			: Effect.fail({
					_tag: 'UnsupportedOperation',
					resource: 'ownPublication',
					operation,
				} satisfies GatewayError),
	);

export const executeOwnPublicationOperation = (
	itemIndex: number,
	gatewayUrl: GatewayUrl,
	operation: string,
): Effect.Effect<GatewayResult, GatewayError, HttpClient.HttpClient | NodeInput> =>
	Effect.gen(function* () {
		const ownPublicationOperation = yield* decodeOwnPublicationOperation(operation);
		const nodeInput = yield* NodeInput;
		const input = yield* nodeInput.getOwnPublicationInput({
			_tag: 'OwnPublication',
			operation: ownPublicationOperation,
		});
		const command = decodeOwnPublicationCommand(input);
		yield* Effect.logDebug('Decoded own publication command').pipe(
			Effect.annotateLogs({
				itemIndex,
				operation: command._tag,
			}),
		);

		const request = buildOwnPublicationRequest(gatewayUrl, command);
		yield* Effect.logDebug('Built own publication request').pipe(
			Effect.annotateLogs({
				itemIndex,
				operation: command._tag,
				method: request.method,
				url: request.url,
			}),
		);

		const rawResponse = yield* executeGatewayRequest(request);
		const result = yield* fromEither(decodeOwnPublicationResponse(command, rawResponse));
		yield* Effect.logDebug('Decoded own publication response').pipe(
			Effect.annotateLogs({
				itemIndex,
				resultType: result.result._tag,
			}),
		);

		return result;
	});
