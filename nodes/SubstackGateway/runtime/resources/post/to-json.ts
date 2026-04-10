import { Match } from 'effect';
import type { IDataObject } from 'n8n-workflow';

import type { GatewayResult } from '../../../domain/result';
import { toJsonComment, toJsonLikedPost, toJsonPost } from './dto';

export const postResultToJson = (
	result: GatewayResult & { readonly _tag: 'Post' },
): ReadonlyArray<IDataObject> =>
	Match.value(result.result).pipe(
		Match.when({ _tag: 'Fetched' }, ({ item }) => [toJsonPost(item)]),
		Match.when({ _tag: 'Comments' }, ({ items }) => items.map(toJsonComment)),
		Match.when({ _tag: 'Liked' }, ({ item }) => [toJsonLikedPost(item)]),
		Match.when({ _tag: 'Unliked' }, ({ item }) => [toJsonLikedPost(item)]),
		Match.exhaustive,
	);
