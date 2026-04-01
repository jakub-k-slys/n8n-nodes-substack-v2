import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

async function ensureSymlink(target, linkPath) {
	await fs.mkdir(path.dirname(linkPath), { recursive: true });

	try {
		const stats = await fs.lstat(linkPath);
		if (stats.isSymbolicLink() || stats.isFile()) {
			await fs.unlink(linkPath);
		} else if (stats.isDirectory()) {
			await fs.rm(linkPath, { recursive: true, force: true });
		}
	} catch (error) {
		if (error?.code !== 'ENOENT') throw error;
	}

	await fs.symlink(target, linkPath, 'dir');
}

export function getDefaultUserFolder() {
	return path.join(process.cwd(), '.n8n-node-dev');
}

export async function prepareDevPackage({
	projectRoot = process.cwd(),
	userFolder = process.env.N8N_USER_FOLDER || getDefaultUserFolder(),
} = {}) {
	const packageJsonPath = path.join(projectRoot, 'package.json');
	const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
	const devPackageDir = path.join(projectRoot, '.dev-package');
	const distDir = path.join(projectRoot, 'dist');

	if (!existsSync(distDir)) {
		throw new Error('Missing dist/ directory. Run `pnpm run build` first.');
	}

	await fs.mkdir(devPackageDir, { recursive: true });

	const devPackageJson = {
		name: packageJson.name,
		version: packageJson.version,
		description: packageJson.description,
		license: packageJson.license,
		homepage: packageJson.homepage,
		keywords: packageJson.keywords,
		author: packageJson.author,
		repository: packageJson.repository,
		n8n: packageJson.n8n,
	};

	await fs.writeFile(
		path.join(devPackageDir, 'package.json'),
		`${JSON.stringify(devPackageJson, null, 2)}\n`,
	);

	await ensureSymlink(distDir, path.join(devPackageDir, 'dist'));

	const customNodeModulesDir = path.join(userFolder, '.n8n', 'custom', 'node_modules');
	await fs.mkdir(customNodeModulesDir, { recursive: true });

	const linkedPackageDir = path.join(customNodeModulesDir, packageJson.name);
	await ensureSymlink(devPackageDir, linkedPackageDir);

	return {
		userFolder,
		devPackageDir,
		linkedPackageDir,
		distDir,
		packageName: packageJson.name,
	};
}
