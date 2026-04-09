import { defineConfig } from 'tsup';

export default defineConfig({
	tsconfig: 'tsconfig.tsup.json',
	entry: {
		'credentials/SubstackGatewayApi.credentials': 'credentials/SubstackGatewayApi.credentials.ts',
		'nodes/SubstackGateway/Gateway.node': 'nodes/SubstackGateway/Gateway.node.ts',
		'nodes/SubstackGateway/FollowingFeed.node': 'nodes/SubstackGateway/FollowingFeed.node.ts',
		'nodes/SubstackGateway/ProfileFeed.node': 'nodes/SubstackGateway/ProfileFeed.node.ts',
	},
	format: ['cjs'],
	target: 'es2019',
	outDir: 'dist',
	clean: true,
	dts: true,
	sourcemap: true,
	splitting: false,
	treeshake: true,
	bundle: true,
	external: ['n8n-workflow'],
});
