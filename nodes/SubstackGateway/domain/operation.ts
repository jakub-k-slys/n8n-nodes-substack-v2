type GatewayOperationOption<Value extends string> = {
	readonly name: string;
	readonly value: Value;
	readonly action: string;
	readonly description?: string;
	readonly requiredFeature?: GatewayApiFeature;
};

type GatewayResourceOption<Resource extends string> = {
	readonly tag: string;
	readonly resource: Resource;
	readonly name: string;
	readonly description?: string;
	readonly defaultOperation: string;
	readonly operations: ReadonlyArray<GatewayOperationOption<string>>;
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
		name: 'Drafts',
		description: 'Create, update, list, and delete Substack post drafts',
		defaultOperation: 'listDrafts',
		operations: [
			{
				name: 'Create',
				value: 'createDraft',
				action: 'Create a draft',
				description: 'Create a new Substack post draft',
				requiredFeature: 'api:drafts:create',
			},
			{
				name: 'Delete',
				value: 'deleteDraft',
				action: 'Delete a draft',
				description: 'Delete a Substack post draft by its ID',
				requiredFeature: 'api:drafts:delete',
			},
			{
				name: 'Get',
				value: 'getDraft',
				action: 'Get a draft',
				description: 'Fetch a Substack post draft by its ID',
				requiredFeature: 'api:drafts:get',
			},
			{
				name: 'Get Many',
				value: 'listDrafts',
				action: 'Get many drafts',
				description: 'List all post drafts on Substack',
				requiredFeature: 'api:drafts:list',
			},
			{
				name: 'Update',
				value: 'updateDraft',
				action: 'Update a draft',
				description: 'Update specific fields of a Substack post draft',
				requiredFeature: 'api:drafts:update',
			},
		] as const satisfies ReadonlyArray<GatewayOperationOption<string>>,
	} as const satisfies GatewayResourceOption<'draft'>,
	{
		tag: 'Note',
		resource: 'note',
		name: 'Notes',
		description: 'Create, read, delete, and react to Substack notes',
		defaultOperation: 'createNote',
		operations: [
			{
				name: 'Create',
				value: 'createNote',
				action: 'Create a note',
				description: 'Convert Markdown content to a Substack note and publish it',
			},
			{
				name: 'Delete',
				value: 'deleteNote',
				action: 'Delete a note',
				description: 'Delete a Substack note by its ID',
			},
			{
				name: 'Get',
				value: 'getNote',
				action: 'Get a note',
				description: 'Return a single Substack note by its ID',
			},
			{
				name: 'Like',
				value: 'likeNote',
				action: 'Like a note',
				description: 'Add a heart like to a Substack note by its ID',
				requiredFeature: 'api:notes:like',
			},
			{
				name: 'Unlike',
				value: 'unlikeNote',
				action: 'Unlike a note',
				description: 'Remove a heart like from a Substack note by its ID',
				requiredFeature: 'api:notes:unlike',
			},
		] as const satisfies ReadonlyArray<GatewayOperationOption<string>>,
	} as const satisfies GatewayResourceOption<'note'>,
	{
		tag: 'OwnPublication',
		resource: 'ownPublication',
		name: 'Me',
		description: 'Read the authenticated user profile, notes, posts, and following list',
		defaultOperation: 'ownProfile',
		operations: [
			{
				name: 'Get Following',
				value: 'ownFollowing',
				action: 'Get my following',
				description: 'Return the list of users the authenticated user follows',
			},
			{
				name: 'Get Notes',
				value: 'ownNotes',
				action: 'Get my notes',
				description: 'Return a page of the authenticated user’s own notes',
			},
			{
				name: 'Get Posts',
				value: 'ownPosts',
				action: 'Get my posts',
				description: 'Return a page of the authenticated user’s own posts',
			},
			{
				name: 'Get Profile',
				value: 'ownProfile',
				action: 'Get my profile',
				description: 'Return the authenticated user’s own Substack profile',
			},
		] as const satisfies ReadonlyArray<GatewayOperationOption<string>>,
	} as const satisfies GatewayResourceOption<'ownPublication'>,
	{
		tag: 'Post',
		resource: 'post',
		name: 'Posts',
		description: 'Read Substack posts, comments, and post reactions',
		defaultOperation: 'getPost',
		operations: [
			{
				name: 'Get',
				value: 'getPost',
				action: 'Get a post',
				description: 'Return a single Substack post with its full content',
			},
			{
				name: 'Get Comments',
				value: 'getPostComments',
				action: 'Get comments for a post',
				description: 'Return comments for the given post',
			},
			{
				name: 'Like',
				value: 'likePost',
				action: 'Like a post',
				description: 'Add a heart like to a Substack post by its ID',
				requiredFeature: 'api:posts:like',
			},
			{
				name: 'Unlike',
				value: 'unlikePost',
				action: 'Unlike a post',
				description: 'Remove a heart like from a Substack post by its ID',
				requiredFeature: 'api:posts:unlike',
			},
		] as const satisfies ReadonlyArray<GatewayOperationOption<string>>,
	} as const satisfies GatewayResourceOption<'post'>,
	{
		tag: 'Profile',
		resource: 'profile',
		name: 'Profiles',
		description: 'Read public Substack profiles, profile notes, and profile posts',
		defaultOperation: 'getProfile',
		operations: [
			{
				name: 'Get',
				value: 'getProfile',
				action: 'Get a profile',
				description: 'Return a public Substack profile by its handle slug',
			},
			{
				name: 'Get Notes',
				value: 'getProfileNotes',
				action: 'Get notes for a profile',
				description: 'Return a page of notes for the given profile slug',
			},
			{
				name: 'Get Posts',
				value: 'getProfilePosts',
				action: 'Get posts for a profile',
				description: 'Return a page of posts for the given profile slug',
			},
		] as const satisfies ReadonlyArray<GatewayOperationOption<string>>,
	} as const satisfies GatewayResourceOption<'profile'>,
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

type GatewayOperationDefinition = GatewayResourceDefinition['operations'][number];

export const gatewayResourceCatalogByResource = Object.fromEntries(
	gatewayResourceCatalog.map((definition) => [definition.resource, definition]),
) as {
	readonly [Resource in GatewayResource]: Extract<
		GatewayResourceDefinition,
		{ readonly resource: Resource }
	>;
};

export const hasGatewayResource = (resource: string): resource is GatewayResource =>
	resource in gatewayResourceCatalogByResource;

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

const isOperationAvailable = (
	operation: GatewayOperationDefinition,
	availableFeatures: ReadonlySet<string> | undefined,
) => operation.requiredFeature === undefined || availableFeatures?.has(operation.requiredFeature) === true;

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

export const getResourceDescription = (resource: GatewayResource): string | undefined =>
	gatewayResourceCatalogByResource[resource].description;

export const getAvailableOperations = (
	resource: GatewayResource,
	features?: ReadonlyArray<string>,
) => {
	const availableFeatures = features === undefined ? undefined : new Set(features);

	return gatewayResourceCatalogByResource[resource].operations.filter((operation) =>
		isOperationAvailable(operation, availableFeatures),
	);
};

export const getAvailableResources = (features?: ReadonlyArray<string>) =>
	gatewayResourceCatalog.filter(
		(resource) => getAvailableOperations(resource.resource, features).length > 0,
	);

export const getStaticDiscoveryOperations = (resource: GatewayResource) =>
	gatewayResourceCatalogByResource[resource].operations.filter(
		(operation) => operation.requiredFeature === undefined,
	);

export const getStaticDiscoveryResources = () =>
	gatewayResourceCatalog.filter(
		(resource) => getStaticDiscoveryOperations(resource.resource).length > 0,
	);
