import * as HttpClient from '@effect/platform/HttpClient';
import { Either, Effect } from 'effect';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import type { GatewayError } from '../../../domain/error';
import type { ProfileOperation } from '../../../domain/operation';
import type { GatewayUrl } from '../../../schema';
import { decodeGatewayOperation } from '../../decode-operation';
import { executeGatewayRequest } from '../../execute-request';
import { toNodeExecutionData } from '../../to-node-data';
import { buildProfileRequest } from './build';
import { decodeProfileCommand } from './decode';
import { decodeProfileResponse } from './decode-response';
import { readProfileInput } from './read-input';

const fromEither = <A>(result: Either.Either<A, GatewayError>): Effect.Effect<A, GatewayError> =>
	Either.isRight(result) ? Effect.succeed(result.right) : Effect.fail(result.left);

const decodeProfileOperation = (operation: string): Effect.Effect<ProfileOperation, GatewayError> =>
	Effect.flatMap(fromEither(decodeGatewayOperation('profile', operation)), (decoded) =>
		decoded._tag === 'Profile'
			? Effect.succeed(decoded.operation)
			: Effect.fail({
					_tag: 'UnsupportedOperation',
					resource: 'profile',
					operation,
				} satisfies GatewayError),
	);

export const executeProfileOperation = (
	context: IExecuteFunctions,
	itemIndex: number,
	gatewayUrl: GatewayUrl,
	operation: string,
): Effect.Effect<INodeExecutionData[], GatewayError, HttpClient.HttpClient> =>
	Effect.gen(function* () {
		const profileOperation = yield* decodeProfileOperation(operation);
		const input = yield* readProfileInput(context, itemIndex, {
			_tag: 'Profile',
			operation: profileOperation,
		});
		const command = yield* fromEither(decodeProfileCommand(input));
		yield* Effect.logDebug('Decoded profile command').pipe(
			Effect.annotateLogs({
				itemIndex,
				operation: command._tag,
			}),
		);

		const request = buildProfileRequest(gatewayUrl, command);
		yield* Effect.logDebug('Built profile request').pipe(
			Effect.annotateLogs({
				itemIndex,
				operation: command._tag,
				method: request.method,
				url: request.url,
			}),
		);

		const rawResponse = yield* executeGatewayRequest(request);
		const result = yield* fromEither(decodeProfileResponse(command, rawResponse));
		yield* Effect.logDebug('Decoded profile response').pipe(
			Effect.annotateLogs({
				itemIndex,
				resultType: result.result._tag,
			}),
		);

		return toNodeExecutionData(itemIndex, result);
	});
