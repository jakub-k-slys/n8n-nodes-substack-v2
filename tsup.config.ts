import { defineConfig } from 'tsup';

export default defineConfig({
	tsconfig: 'tsconfig.tsup.json',
	entry: {
		'credentials/SubstackGatewayApi.credentials': 'credentials/SubstackGatewayApi.credentials.ts',
		'nodes/SubstackGateway/SubstackGateway.node': 'nodes/SubstackGateway/SubstackGateway.node.ts',
		'nodes/SubstackFollowingFeedTrigger/SubstackFollowingFeedTrigger.node':
			'nodes/SubstackFollowingFeedTrigger/SubstackFollowingFeedTrigger.node.ts',
		'nodes/SubstackProfileFeedTrigger/SubstackProfileFeedTrigger.node':
			'nodes/SubstackProfileFeedTrigger/SubstackProfileFeedTrigger.node.ts',
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
