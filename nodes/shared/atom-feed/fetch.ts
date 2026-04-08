import { Effect } from 'effect';
import type { IHttpRequestOptions, IPollFunctions } from 'n8n-workflow';

type PollRequestContext = Pick<IPollFunctions, 'helpers'>;

const ACCEPT_HEADER = 'application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8';

export const fetchAtomFeed = (
	context: PollRequestContext,
	url: string,
): Effect.Effect<string, Error> =>
	Effect.tryPromise({
		try: async () => {
			const response = (await context.helpers.httpRequestWithAuthentication.call(
				context,
				'substackGatewayApi',
				{
					url,
					method: 'GET',
					json: false,
					returnFullResponse: true,
					headers: {
						accept: ACCEPT_HEADER,
					},
				} satisfies IHttpRequestOptions,
			)) as {
				body?: unknown;
			};

			if (typeof response.body !== 'string') {
				throw new Error('Expected Atom feed response body to be a string');
			}

			return response.body;
		},
		catch: (cause) =>
			cause instanceof Error ? cause : new Error('Failed to fetch Atom feed', { cause }),
	});
