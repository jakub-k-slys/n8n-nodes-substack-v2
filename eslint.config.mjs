import { configWithoutCloudSupport } from '@n8n/node-cli/eslint';

export default [
	...configWithoutCloudSupport,
	{
		ignores: ['.old/**'],
	},
	{
		files: ['test/package/*.test.ts'],
		rules: {
			'import-x/no-unresolved': 'off',
		},
	},
];
