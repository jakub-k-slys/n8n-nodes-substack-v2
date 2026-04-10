import { Match } from 'effect';
import type { IDataObject } from 'n8n-workflow';

import type { GatewayResult } from '../../../domain/result';
import { toJsonCreatedNote, toJsonDeletedNote, toJsonLikedNote, toJsonNote } from './dto';

export const noteResultToJson = (
	result: GatewayResult & { readonly _tag: 'Note' },
): ReadonlyArray<IDataObject> =>
	Match.value(result.result).pipe(
		Match.when({ _tag: 'Created' }, ({ item }) => [toJsonCreatedNote(item)]),
		Match.when({ _tag: 'Fetched' }, ({ item }) => [toJsonNote(item)]),
		Match.when({ _tag: 'Deleted' }, ({ item }) => [toJsonDeletedNote(item)]),
		Match.when({ _tag: 'Liked' }, ({ item }) => [toJsonLikedNote(item)]),
		Match.when({ _tag: 'Unliked' }, ({ item }) => [toJsonLikedNote(item)]),
		Match.exhaustive,
	);
