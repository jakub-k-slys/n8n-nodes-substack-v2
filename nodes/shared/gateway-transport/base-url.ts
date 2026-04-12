const API_VERSION_PATH = '/api/v1';

export const toGatewayRootUrl = (gatewayUrl: string): string =>
	gatewayUrl.replace(/\/+$/, '').replace(/\/api\/v1$/i, '');

export const toGatewayApiBaseUrl = (gatewayUrl: string): string =>
	`${toGatewayRootUrl(gatewayUrl)}${API_VERSION_PATH}`;
