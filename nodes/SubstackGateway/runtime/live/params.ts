import type { IExecuteFunctions } from 'n8n-workflow';

type DraftPayload = {
	readonly title: string | null;
	readonly subtitle: string | null;
	readonly body: string | null;
};

export const getOptionalString = (
	context: IExecuteFunctions,
	name: string,
	itemIndex: number,
): string | undefined => {
	const value = String(context.getNodeParameter(name, itemIndex, '')).trim();
	return value === '' ? undefined : value;
};

export const getDraftPayload = (context: IExecuteFunctions, itemIndex: number): DraftPayload => ({
	title: getOptionalString(context, 'title', itemIndex) ?? null,
	subtitle: getOptionalString(context, 'subtitle', itemIndex) ?? null,
	body: getOptionalString(context, 'body', itemIndex) ?? null,
});
