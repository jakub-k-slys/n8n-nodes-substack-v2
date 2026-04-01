import { watch } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { getDefaultUserFolder, prepareDevPackage } from './dev-package.mjs';

const projectRoot = process.cwd();
const userFolder = process.env.N8N_USER_FOLDER || getDefaultUserFolder();

function run(command, args, env = {}) {
	return spawn(command, args, {
		cwd: projectRoot,
		env: { ...process.env, ...env },
		stdio: 'inherit',
	});
}

async function main() {
	console.log('Building project before starting dev environment...');
	await new Promise((resolve, reject) => {
		const build = run('pnpm', ['exec', 'n8n-node', 'build']);
		build.on('exit', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`Initial build failed with code ${code}`));
		});
		build.on('error', reject);
	});

	const prepared = await prepareDevPackage({ projectRoot, userFolder });
	console.log(`Prepared ${prepared.devPackageDir}`);
	console.log(`Linked ${prepared.linkedPackageDir}`);
	console.log(`Using N8N_USER_FOLDER=${prepared.userFolder}`);

	const tsc = run('pnpm', ['exec', 'tsc', '--watch', '--pretty']);
	const n8n = run(
		'pnpm',
		['exec', 'n8n'],
		{
			N8N_DEV_RELOAD: 'true',
			N8N_USER_FOLDER: userFolder,
			DB_SQLITE_POOL_SIZE: '10',
		},
	);

	let isShuttingDown = false;

	const shutdown = (code = 0) => {
		if (isShuttingDown) return;
		isShuttingDown = true;
		tsc.kill('SIGINT');
		n8n.kill('SIGINT');
		setTimeout(() => process.exit(code), 250);
	};

	process.on('SIGINT', () => shutdown(0));
	process.on('SIGTERM', () => shutdown(0));

	tsc.on('exit', (code) => {
		if (!isShuttingDown && code !== 0) shutdown(code ?? 1);
	});

	n8n.on('exit', (code) => {
		if (!isShuttingDown) shutdown(code ?? 0);
	});

	let packageRefreshTimer;

	try {
		const packageWatcher = watch(path.join(projectRoot, 'package.json'), () => {
			clearTimeout(packageRefreshTimer);
			packageRefreshTimer = setTimeout(() => {
				void prepareDevPackage({ projectRoot, userFolder });
			}, 150);
		});
		packageWatcher.on('error', (error) => {
			console.warn(`Package watcher error: ${error.message}`);
		});
	} catch (error) {
		console.warn('Package watcher could not be started. Restart `pnpm run dev` after editing package.json.');
	}

	console.log('TypeScript changes will rebuild automatically. Re-run `pnpm run build` if you change static assets.');
}

await main();
