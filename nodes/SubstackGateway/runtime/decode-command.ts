import { Either, Effect, Match } from 'effect';
import type { IExecuteFunctions } from 'n8n-workflow';

import type { GatewayCommand } from '../domain/command';
import type { GatewayError } from '../domain/error';
import type { GatewayResource } from '../domain/operation';
import { decodeDraftCommand } from './decode/draft';
import { decodeNoteCommand } from './decode/note';
import { decodeOwnPublicationCommand } from './decode/own-publication';
import { decodePostCommand } from './decode/post';
import { decodeProfileCommand } from './decode/profile';
import { decodeGatewayOperation } from './decode-operation';

export const decodeGatewayCommand = (
	context: IExecuteFunctions,
	itemIndex: number,
): Effect.Effect<GatewayCommand, GatewayError> =>
	Effect.try({
		try: () => ({
			resource: context.getNodeParameter('resource', itemIndex) as GatewayResource,
			operation: context.getNodeParameter('operation', itemIndex) as string,
		}),
		catch: (cause) =>
			({
				_tag: 'UnexpectedError',
				message: cause instanceof Error ? cause.message : 'Unknown error',
				cause,
			}) satisfies GatewayError,
	}).pipe(
		Effect.flatMap(({ resource, operation }) => {
			return Either.flatMap(decodeGatewayOperation(resource, operation), (decodedOperation) =>
				Match.value(decodedOperation).pipe(
					Match.when({ _tag: 'OwnPublication' }, ({ operation }) =>
						Either.right({
							_tag: 'OwnPublication',
							command: decodeOwnPublicationCommand(operation),
						} as const),
					),
					Match.when({ _tag: 'Note' }, ({ operation }) =>
						Either.map(decodeNoteCommand(context, itemIndex, operation), (command) => ({
							_tag: 'Note',
							command,
						} as const)),
					),
					Match.when({ _tag: 'Draft' }, ({ operation }) =>
						Either.map(decodeDraftCommand(context, itemIndex, operation), (command) => ({
							_tag: 'Draft',
							command,
						} as const)),
					),
					Match.when({ _tag: 'Post' }, ({ operation }) =>
						Either.map(decodePostCommand(context, itemIndex, operation), (command) => ({
							_tag: 'Post',
							command,
						} as const)),
					),
					Match.when({ _tag: 'Profile' }, ({ operation }) =>
						Either.map(decodeProfileCommand(context, itemIndex, operation), (command) => ({
							_tag: 'Profile',
							command,
						} as const)),
					),
					Match.exhaustive,
				),
			);
		}),
	);
