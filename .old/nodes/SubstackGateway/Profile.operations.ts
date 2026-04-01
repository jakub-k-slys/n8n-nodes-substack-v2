import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from './shared/SubstackGatewayClient';
import { IStandardResponse } from './types';
import { DataFormatters } from './shared/DataFormatters';
import { OperationHandler } from './shared/OperationHandler';

export enum ProfileOperation {
	GetOwnProfile = 'getOwnProfile',
	GetProfileBySlug = 'getProfileBySlug',
	GetFollowees = 'getFollowees',
}

export const profileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'getOwnProfile',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['profile'],
			},
		},
		options: [
			{
				name: 'Get Own Profile',
				value: ProfileOperation.GetOwnProfile,
				description: 'Get your own profile information',
				action: 'Get own profile',
			},
			{
				name: 'Get Profile by Slug',
				value: ProfileOperation.GetProfileBySlug,
				description: 'Get a profile by its publication slug',
				action: 'Get profile by slug',
			},
			{
				name: 'Get Followees',
				value: ProfileOperation.GetFollowees,
				description: 'Get users that you follow',
				action: 'Get followees',
			},
		],
	},
];

async function getOwnProfile(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	return OperationHandler.execute(executeFunctions, itemIndex, async () => {
		const profile = await client.ownProfile();
		return DataFormatters.formatProfile(profile);
	});
}

async function getProfileBySlug(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	return OperationHandler.execute(executeFunctions, itemIndex, async () => {
		const slug = executeFunctions.getNodeParameter('slug', itemIndex) as string;
		const profile = await client.profileForSlug(slug);
		return DataFormatters.formatProfile(profile);
	});
}

async function getFollowees(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	return OperationHandler.execute(executeFunctions, itemIndex, async () => {
		const returnType = executeFunctions.getNodeParameter(
			'returnType',
			itemIndex,
			'profiles',
		) as string;
		const limit = OperationHandler.getLimit(executeFunctions, itemIndex);

		const ownProfile = await client.ownProfile();
		return OperationHandler.collectFromIterable(ownProfile.following(), limit, (followee) =>
			DataFormatters.formatFollowing(followee, returnType),
		);
	});
}

export const profileOperationHandlers: Record<
	ProfileOperation,
	(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) => Promise<IStandardResponse>
> = {
	[ProfileOperation.GetOwnProfile]: getOwnProfile,
	[ProfileOperation.GetProfileBySlug]: getProfileBySlug,
	[ProfileOperation.GetFollowees]: getFollowees,
};
