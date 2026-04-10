import * as HttpClientRequest from '@effect/platform/HttpClientRequest';
import * as ClientResponse from '@effect/platform/HttpClientResponse';

const toResponseBody = (body: unknown) => {
	if (body === undefined || body === null) {
		return null;
	}

	if (typeof body === 'string') {
		return body;
	}

	return JSON.stringify(body);
};

const hasBody = (statusCode: number) => ![204, 205, 304].includes(statusCode);

export const toClientResponse = (
	request: HttpClientRequest.HttpClientRequest,
	result: unknown,
): ClientResponse.HttpClientResponse => {
	const response =
		typeof result === 'object' && result !== null && 'statusCode' in result
			? (result as {
					body?: unknown;
					headers?: Record<string, string>;
					statusCode: number;
					statusMessage?: string;
				})
			: { body: result, headers: {}, statusCode: 200 };

	const headers = {
		...(response.headers ?? {}),
		...(response.body !== null &&
		response.body !== undefined &&
		typeof response.body !== 'string' &&
		(response.headers?.['content-type'] ?? response.headers?.['Content-Type']) === undefined
			? { 'content-type': 'application/json' }
			: {}),
	};

	return ClientResponse.fromWeb(
		request,
		new Response(hasBody(response.statusCode) ? toResponseBody(response.body) : null, {
			status: response.statusCode,
			statusText: response.statusMessage,
			headers,
		}),
	);
};
