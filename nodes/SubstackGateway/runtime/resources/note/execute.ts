import * as HttpClient from '@effect/platform/HttpClient';
import { Effect } from 'effect';

import type { GatewayError } from '../../../domain/error';
import type { GatewayResult } from '../../../domain/result';
import type { GatewayUrl } from '../../../schema';
import { NodeInput } from '../../node-input';
import { decodeTaggedOperation, executeResourceOperation, fromEither } from '../../resource-executor';
import { buildNoteRequest } from './build';
import { decodeNoteCommand } from './decode';
import { decodeNoteResponse } from './decode-response';

export const executeNoteOperation = (
	itemIndex: number,
	gatewayUrl: GatewayUrl,
	operation: string,
): Effect.Effect<GatewayResult, GatewayError, HttpClient.HttpClient | NodeInput> =>
	executeResourceOperation({
		itemIndex,
		gatewayUrl,
		operation,
		logLabel: 'note',
		decodeOperation: (operation) =>
			decodeTaggedOperation<
				'createNote' | 'getNote' | 'deleteNote' | 'likeNote' | 'unlikeNote'
			>('note', 'Note', operation),
		readInput: (nodeInput, operation) =>
			nodeInput.getNoteInput({
				_tag: 'Note',
				operation,
			}),
		decodeCommand: (input) => fromEither(decodeNoteCommand(input)),
		buildRequest: buildNoteRequest,
		decodeResponse: (command, rawResponse) => fromEither(decodeNoteResponse(command, rawResponse)),
	});
