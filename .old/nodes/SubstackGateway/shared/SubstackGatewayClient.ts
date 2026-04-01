import axios, { AxiosInstance } from 'axios';
import rateLimit from 'axios-rate-limit';

export interface SubstackClientConfig {
	publicationUrl: string;
	token: string;
	gatewayUrl?: string;
	perPage?: number;
	maxRequestsPerSecond?: number;
}

export interface SubstackProfileSummary {
	id: number;
	name: string;
	handle: string;
	slug: string;
	url: string;
	bio?: string;
	avatarUrl?: string;
}

export interface SubstackProfile extends SubstackProfileSummary {
	posts(): AsyncIterable<SubstackPostSummary>;
	notes(): AsyncIterable<SubstackNote>;
}

export interface SubstackOwnProfile extends SubstackProfile {
	following(): AsyncIterable<SubstackProfileSummary>;
	publishNote(content: string, options?: { attachment?: string }): Promise<SubstackPublishNoteResponse>;
}

export interface SubstackPostSummary {
	id: number;
	title: string;
	subtitle: string;
	slug?: string;
	url?: string;
	truncatedBody: string;
	htmlBody: string;
	markdown: string;
	publishedAt: string;
}

export interface SubstackPost extends SubstackPostSummary {
	comments(): AsyncIterable<SubstackComment>;
}

export interface SubstackNote {
	id: number;
	body: string;
	likesCount: number;
	publishedAt: string;
	author: {
		id: number;
		name: string;
		handle: string;
		avatarUrl?: string;
	};
}

export interface SubstackComment {
	id: number;
	body: string;
	isAdmin: boolean;
}

export interface SubstackPublishNoteResponse {
	id: number;
}

interface GatewayProfileResponse {
	id: number;
	handle: string;
	name: string;
	url: string;
	avatar_url?: string;
	bio?: string;
}

interface GatewayPostResponse {
	id: number;
	title: string;
	subtitle?: string;
	slug?: string;
	url?: string;
	truncated_body?: string;
	html_body?: string;
	markdown?: string;
	published_at: string;
}

interface GatewayPostsPageResponse {
	items: GatewayPostResponse[];
}

interface GatewayNoteResponse {
	id: number;
	body: string;
	likes_count: number;
	published_at: string;
	author: {
		id: number;
		name: string;
		handle: string;
		avatar_url?: string;
	};
}

interface GatewayNotesPageResponse {
	items: GatewayNoteResponse[];
	next_cursor?: string | null;
}

interface GatewayFollowingResponse {
	items: Array<{ id: number; handle: string }>;
}

interface GatewayCommentsResponse {
	items: Array<{ id: number; body: string; is_admin?: boolean }>;
}

interface GatewayCreateNoteResponse {
	id: number;
}

class GatewayHttpClient {
	private readonly client: AxiosInstance;

	constructor(config: SubstackClientConfig) {
		const gatewayBase = (config.gatewayUrl ?? 'https://substack-gateway.vercel.app').replace(/\/$/, '');
		const baseUrl = `${gatewayBase}/api/v1`;
		const maxRequestsPerSecond = config.maxRequestsPerSecond ?? 25;

		const axiosClient = axios.create({
			baseURL: baseUrl,
			headers: {
				Authorization: `Bearer ${config.token}`,
				'x-publication-url': config.publicationUrl,
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		this.client = rateLimit(axiosClient, {
			maxRequests: maxRequestsPerSecond,
			perMilliseconds: 1000,
		});
	}

	async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
		const response = await this.client.get<T>(path, { params });
		return response.data;
	}

	async post<T>(path: string, payload?: unknown): Promise<T> {
		const response = await this.client.post<T>(path, payload);
		return response.data;
	}
}

class GatewayProfileContext implements SubstackProfile {
	public readonly id: number;
	public readonly name: string;
	public readonly handle: string;
	public readonly slug: string;
	public readonly url: string;
	public readonly bio?: string;
	public readonly avatarUrl?: string;

	constructor(
		protected readonly httpClient: GatewayHttpClient,
		protected readonly perPage: number,
		rawData: GatewayProfileResponse,
	) {
		this.id = rawData.id;
		this.name = rawData.name;
		this.handle = rawData.handle;
		this.slug = rawData.handle;
		this.url = rawData.url;
		this.bio = rawData.bio;
		this.avatarUrl = rawData.avatar_url;
	}

	async *posts(): AsyncIterable<SubstackPostSummary> {
		let offset = 0;
		while (true) {
			const response = await this.httpClient.get<GatewayPostsPageResponse>(
				`/profiles/${encodeURIComponent(this.slug)}/posts`,
				{ limit: this.perPage, offset },
			);
			const items = response.items ?? [];
			if (items.length === 0) break;

			for (const item of items) {
				yield {
					id: item.id,
					title: item.title,
					subtitle: item.subtitle ?? '',
					slug: item.slug,
					url: item.url,
					truncatedBody: item.truncated_body ?? '',
					htmlBody: item.html_body ?? '',
					markdown: item.markdown ?? '',
					publishedAt: item.published_at,
				};
			}

			if (items.length < this.perPage) break;
			offset += this.perPage;
		}
	}

	async *notes(): AsyncIterable<SubstackNote> {
		let cursor: string | undefined = undefined;
		while (true) {
			const response: GatewayNotesPageResponse = await this.httpClient.get<GatewayNotesPageResponse>(
				`/profiles/${encodeURIComponent(this.slug)}/notes`,
				{ cursor },
			);
			const items = response.items ?? [];
			for (const item of items) {
				yield {
					id: item.id,
					body: item.body,
					likesCount: item.likes_count ?? 0,
					publishedAt: item.published_at,
					author: {
						id: item.author?.id,
						name: item.author?.name,
						handle: item.author?.handle,
						avatarUrl: item.author?.avatar_url,
					},
				};
			}

			if (!response.next_cursor) break;
			cursor = response.next_cursor;
		}
	}
}

class GatewayOwnProfileContext extends GatewayProfileContext implements SubstackOwnProfile {
	async *notes(): AsyncIterable<SubstackNote> {
		let cursor: string | undefined = undefined;
		while (true) {
			const response: GatewayNotesPageResponse = await this.httpClient.get<GatewayNotesPageResponse>('/me/notes', { cursor });
			const items = response.items ?? [];
			for (const item of items) {
				yield {
					id: item.id,
					body: item.body,
					likesCount: item.likes_count ?? 0,
					publishedAt: item.published_at,
					author: {
						id: item.author?.id,
						name: item.author?.name,
						handle: item.author?.handle,
						avatarUrl: item.author?.avatar_url,
					},
				};
			}

			if (!response.next_cursor) break;
			cursor = response.next_cursor;
		}
	}

	async *following(): AsyncIterable<SubstackProfileSummary> {
		const following = await this.httpClient.get<GatewayFollowingResponse>('/me/following');
		for (const user of following.items ?? []) {
			try {
				const profile = await this.httpClient.get<GatewayProfileResponse>(
					`/profiles/${encodeURIComponent(user.handle)}`,
				);
				yield {
					id: profile.id,
					name: profile.name,
					handle: profile.handle,
					slug: profile.handle,
					url: profile.url,
					bio: profile.bio,
					avatarUrl: profile.avatar_url,
				};
			} catch {
				// Skip inaccessible followee profiles
			}
		}
	}

	async publishNote(
		content: string,
		options?: { attachment?: string },
	): Promise<SubstackPublishNoteResponse> {
		const payload: Record<string, string> = { content };
		if (options?.attachment) {
			payload.attachment = options.attachment;
		}

		const response = await this.httpClient.post<GatewayCreateNoteResponse>('/notes', payload);
		return { id: response.id };
	}
}

class GatewayPostContext implements SubstackPost {
	public readonly id: number;
	public readonly title: string;
	public readonly subtitle: string;
	public readonly slug?: string;
	public readonly url?: string;
	public readonly truncatedBody: string;
	public readonly htmlBody: string;
	public readonly markdown: string;
	public readonly publishedAt: string;

	constructor(private readonly httpClient: GatewayHttpClient, rawData: GatewayPostResponse) {
		this.id = rawData.id;
		this.title = rawData.title;
		this.subtitle = rawData.subtitle ?? '';
		this.slug = rawData.slug;
		this.url = rawData.url;
		this.truncatedBody = rawData.truncated_body ?? '';
		this.htmlBody = rawData.html_body ?? '';
		this.markdown = rawData.markdown ?? '';
		this.publishedAt = rawData.published_at;
	}

	async *comments(): AsyncIterable<SubstackComment> {
		const response = await this.httpClient.get<GatewayCommentsResponse>(`/posts/${this.id}/comments`);
		for (const item of response.items ?? []) {
			yield {
				id: item.id,
				body: item.body,
				isAdmin: item.is_admin ?? false,
			};
		}
	}
}

export class SubstackClient {
	private readonly httpClient: GatewayHttpClient;
	private readonly perPage: number;

	constructor(config: SubstackClientConfig) {
		this.httpClient = new GatewayHttpClient(config);
		this.perPage = config.perPage ?? 25;
	}

	async ownProfile(): Promise<SubstackOwnProfile> {
		const profile = await this.httpClient.get<GatewayProfileResponse>('/me');
		return new GatewayOwnProfileContext(this.httpClient, this.perPage, profile);
	}

	async profileForSlug(slug: string): Promise<SubstackProfile> {
		if (!slug || slug.trim() === '') {
			throw new Error('Profile slug cannot be empty');
		}

		const profile = await this.httpClient.get<GatewayProfileResponse>(
			`/profiles/${encodeURIComponent(slug)}`,
		);
		return new GatewayProfileContext(this.httpClient, this.perPage, profile);
	}

	async postForId(id: number): Promise<SubstackPost> {
		const post = await this.httpClient.get<GatewayPostResponse>(`/posts/${id}`);
		return new GatewayPostContext(this.httpClient, post);
	}

	async noteForId(id: number): Promise<SubstackNote> {
		const note = await this.httpClient.get<GatewayNoteResponse>(`/notes/${id}`);
		return {
			id: note.id,
			body: note.body,
			likesCount: note.likes_count ?? 0,
			publishedAt: note.published_at,
			author: {
				id: note.author?.id,
				name: note.author?.name,
				handle: note.author?.handle,
				avatarUrl: note.author?.avatar_url,
			},
		};
	}
}
