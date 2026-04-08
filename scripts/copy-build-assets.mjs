import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();

const filesToCopy = [
	'package.json',
	'nodes/SubstackGateway/SubstackGateway.node.json',
	'nodes/SubstackFollowingFeedTrigger/SubstackFollowingFeedTrigger.node.json',
	'nodes/SubstackProfileFeedTrigger/SubstackProfileFeedTrigger.node.json',
	'nodes/SubstackGateway/substackGateway.svg',
	'nodes/SubstackGateway/substackGateway.dark.svg',
];

for (const relativePath of filesToCopy) {
	const sourcePath = path.join(projectRoot, relativePath);
	const destinationPath = path.join(projectRoot, 'dist', relativePath);

	await fs.mkdir(path.dirname(destinationPath), { recursive: true });
	await fs.copyFile(sourcePath, destinationPath);
}
