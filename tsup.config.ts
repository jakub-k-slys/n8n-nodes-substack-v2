import { defineConfig } from 'tsup';

export default defineConfig({
	tsconfig: 'tsconfig.tsup.json',
	entry: {
		'credentials/SubstackGatewayApi.credentials': 'credentials/SubstackGatewayApi.credentials.ts',
		'nodes/SubstackGateway/SubstackGateway.node': 'nodes/SubstackGateway/SubstackGateway.node.ts',
		'nodes/SubstackGatewayFollowingFeed/SubstackGatewayFollowingFeed.node':
			'nodes/SubstackGatewayFollowingFeed/SubstackGatewayFollowingFeed.node.ts',
		'nodes/SubstackGatewayProfileFeed/SubstackGatewayProfileFeed.node':
			'nodes/SubstackGatewayProfileFeed/SubstackGatewayProfileFeed.node.ts',
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
