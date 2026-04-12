type GatewayOperationOption<Value extends string> = {
	readonly name: string;
	readonly value: Value;
	readonly action: string;
	readonly description?: string;
	readonly requiredFeature?: GatewayApiFeature;
};

export type GatewayApiFeature =
	| 'api:drafts:create'
	| 'api:drafts:delete'
	| 'api:drafts:get'
	| 'api:drafts:list'
	| 'api:drafts:update'
	| 'api:me:following:list'
	| 'api:me:get'
	| 'api:me:notes:list'
	| 'api:me:posts:list'
	| 'api:notes:create'
	| 'api:notes:delete'
	| 'api:notes:get'
	| 'api:notes:like'
	| 'api:notes:unlike'
	| 'api:posts:comments:list'
	| 'api:posts:get'
	| 'api:posts:like'
	| 'api:posts:unlike'
	| 'api:profiles:get'
	| 'api:profiles:notes:list'
	| 'api:profiles:posts:list';

const FEATURE_GATED_DESCRIPTION = 'Requires gateway feature support and is not available in OSS';

const withFeatureDescription = (
	description: string | undefined,
	requiredFeature: GatewayApiFeature | undefined,
): string | undefined =>
	requiredFeature === undefined
		? description
		: description === undefined || description === FEATURE_GATED_DESCRIPTION
			? FEATURE_GATED_DESCRIPTION
			: [description, FEATURE_GATED_DESCRIPTION].join('. ');

export const gatewayResourceCatalog = [
	{
		tag: 'Draft',
		resource: 'draft',
		name: 'Draft',
		defaultOperation: 'listDrafts',
		operations: [
			{
				name: 'Create',
				value: 'createDraft',
				action: 'Create a draft',
				description: FEATURE_GATED_DESCRIPTION,
				requiredFeature: 'api:drafts:create',
			},
			{
				name: 'Delete',
				value: 'deleteDraft',
				action: 'Delete a draft',
				description: FEATURE_GATED_DESCRIPTION,
				requiredFeature: 'api:drafts:delete',
			},
			{
				name: 'Get',
				value: 'getDraft',
				action: 'Get a draft',
				description: FEATURE_GATED_DESCRIPTION,
				requiredFeature: 'api:drafts:get',
			},
			{
				name: 'Get Many',
				value: 'listDrafts',
				action: 'Get many drafts',
				description: FEATURE_GATED_DESCRIPTION,
				requiredFeature: 'api:drafts:list',
			},
			{
				name: 'Update',
				value: 'updateDraft',
				action: 'Update a draft',
				description: FEATURE_GATED_DESCRIPTION,
				requiredFeature: 'api:drafts:update',
			},
		] as const satisfies ReadonlyArray<GatewayOperationOption<string>>,
	},
	{
		tag: 'Note',
		resource: 'note',
		name: 'Note',
		defaultOperation: 'createNote',
		operations: [
			{
				name: 'Create',
				value: 'createNote',
				action: 'Create a note',
			},
			{
				name: 'Delete',
				value: 'deleteNote',
				action: 'Delete a note',
			},
			{
				name: 'Get',
				value: 'getNote',
				action: 'Get a note',
			},
			{
				name: 'Like',
				value: 'likeNote',
				action: 'Like a note',
				description: FEATURE_GATED_DESCRIPTION,
				requiredFeature: 'api:notes:like',
			},
			{
				name: 'Unlike',
				value: 'unlikeNote',
				action: 'Unlike a note',
				description: FEATURE_GATED_DESCRIPTION,
				requiredFeature: 'api:notes:unlike',
			},
		] as const satisfies ReadonlyArray<GatewayOperationOption<string>>,
	},
	{
		tag: 'OwnPublication',
		resource: 'ownPublication',
		name: 'Own Publication',
		defaultOperation: 'ownProfile',
		operations: [
			{
				name: 'Own Following',
				value: 'ownFollowing',
				action: 'Get own following',
				description: 'Get the accounts followed by the authenticated user',
			},
			{
				name: 'Own Notes',
				value: 'ownNotes',
				action: 'Get own notes',
				description: 'Get notes from the authenticated user',
			},
			{
				name: 'Own Posts',
				value: 'ownPosts',
				action: 'Get own posts',
				description: 'Get posts from the authenticated user',
			},
			{
				name: 'Own Profile',
				value: 'ownProfile',
				action: 'Get own profile',
				description: 'Get the authenticated user profile from Substack Gateway',
			},
		] as const satisfies ReadonlyArray<GatewayOperationOption<string>>,
	},
	{
		tag: 'Post',
		resource: 'post',
		name: 'Post',
		defaultOperation: 'getPost',
		operations: [
			{
				name: 'Get',
				value: 'getPost',
				action: 'Get a post',
			},
			{
				name: 'Get Comments',
				value: 'getPostComments',
				action: 'Get comments for a post',
			},
			{
				name: 'Like',
				value: 'likePost',
				action: 'Like a post',
				description: FEATURE_GATED_DESCRIPTION,
				requiredFeature: 'api:posts:like',
			},
			{
				name: 'Unlike',
				value: 'unlikePost',
				action: 'Unlike a post',
				description: FEATURE_GATED_DESCRIPTION,
				requiredFeature: 'api:posts:unlike',
			},
		] as const satisfies ReadonlyArray<GatewayOperationOption<string>>,
	},
	{
		tag: 'Profile',
		resource: 'profile',
		name: 'Profile',
		defaultOperation: 'getProfile',
		operations: [
			{
				name: 'Get',
				value: 'getProfile',
				action: 'Get a profile',
			},
			{
				name: 'Get Notes',
				value: 'getProfileNotes',
				action: 'Get notes for a profile',
			},
			{
				name: 'Get Posts',
				value: 'getProfilePosts',
				action: 'Get posts for a profile',
			},
		] as const satisfies ReadonlyArray<GatewayOperationOption<string>>,
	},
] as const;

type GatewayResourceDefinition = (typeof gatewayResourceCatalog)[number];

type ResourceDefinitionByTag<Tag extends GatewayResourceDefinition['tag']> = Extract<
	GatewayResourceDefinition,
	{ readonly tag: Tag }
>;

export type GatewayResource = GatewayResourceDefinition['resource'];

export type OwnPublicationOperation =
	ResourceDefinitionByTag<'OwnPublication'>['operations'][number]['value'];

export type NoteOperation = ResourceDefinitionByTag<'Note'>['operations'][number]['value'];

export type DraftOperation = ResourceDefinitionByTag<'Draft'>['operations'][number]['value'];

export type PostOperation = ResourceDefinitionByTag<'Post'>['operations'][number]['value'];

export type ProfileOperation = ResourceDefinitionByTag<'Profile'>['operations'][number]['value'];

export type GatewayOperation =
	| { readonly _tag: 'OwnPublication'; readonly operation: OwnPublicationOperation }
	| { readonly _tag: 'Note'; readonly operation: NoteOperation }
	| { readonly _tag: 'Draft'; readonly operation: DraftOperation }
	| { readonly _tag: 'Post'; readonly operation: PostOperation }
	| { readonly _tag: 'Profile'; readonly operation: ProfileOperation };

export const gatewayResourceCatalogByResource = Object.fromEntries(
	gatewayResourceCatalog.map((definition) => [definition.resource, definition]),
) as {
	readonly [Resource in GatewayResource]: Extract<
		GatewayResourceDefinition,
		{ readonly resource: Resource }
	>;
};

const toGatewayOperation = <Tag extends GatewayResourceDefinition['tag']>(
	tag: Tag,
	operation: ResourceDefinitionByTag<Tag>['operations'][number]['value'],
): Extract<GatewayOperation, { readonly _tag: Tag }> =>
	({
		_tag: tag,
		operation,
	}) as Extract<GatewayOperation, { readonly _tag: Tag }>;

export const buildGatewayOperation = <Resource extends GatewayResource>(
	resource: Resource,
	operation: (typeof gatewayResourceCatalogByResource)[Resource]['operations'][number]['value'],
): GatewayOperation => toGatewayOperation(gatewayResourceCatalogByResource[resource].tag, operation);

const getGatewayOperationDefinition = (operation: GatewayOperation) =>
	gatewayResourceCatalogByResource[
		gatewayResourceCatalog.find((candidate) => candidate.tag === operation._tag)!.resource
	].operations.find((candidate) => candidate.value === operation.operation)!;

export const getRequiredFeatureForOperation = (
	operation: GatewayOperation,
): GatewayApiFeature | undefined => getGatewayOperationDefinition(operation).requiredFeature;

export const getOperationDescription = (resource: GatewayResource, operationValue: string) =>
	withFeatureDescription(
		gatewayResourceCatalogByResource[resource].operations.find(
			(operation) => operation.value === operationValue,
		)?.description,
		gatewayResourceCatalogByResource[resource].operations.find(
			(operation) => operation.value === operationValue,
		)?.requiredFeature,
	);

export const getOperationDisplayName = (operation: GatewayOperation): string =>
	getGatewayOperationDefinition(operation).name;
