import { watch } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { getDefaultUserFolder, prepareDevPackage } from './dev-package.mjs';

const projectRoot = process.cwd();
const userFolder = process.env.N8N_USER_FOLDER || getDefaultUserFolder();

function run(command, args, env = {}, options = {}) {
	const {
		piped = true,
	} = options;

	const child = spawn(command, args, {
		cwd: projectRoot,
		env: { ...process.env, ...env },
		stdio: piped ? ['inherit', 'pipe', 'pipe'] : 'inherit',
	});

	if (piped) {
		child.stdout?.pipe(process.stdout);
		child.stderr?.pipe(process.stderr);
	}

	return child;
}

function waitForInitialWatchBuild(buildProcess) {
	return new Promise((resolve, reject) => {
		let stdoutBuffer = '';
		let stderrBuffer = '';
		let resolved = false;

		const cleanup = () => {
			buildProcess.stdout?.off('data', onStdout);
			buildProcess.stderr?.off('data', onStderr);
			buildProcess.off('exit', onExit);
			buildProcess.off('error', onError);
		};

		const maybeResolve = (chunk) => {
			if (resolved) return;

			stdoutBuffer += chunk;
			stderrBuffer += chunk;

			if (
				stdoutBuffer.includes('CLI Watching for changes in "."') ||
				stdoutBuffer.includes('DTS ⚡️ Build success') ||
				stderrBuffer.includes('DTS ⚡️ Build success')
			) {
				resolved = true;
				cleanup();
				resolve();
			}
		};

		const onStdout = (data) => maybeResolve(String(data));
		const onStderr = (data) => maybeResolve(String(data));
		const onExit = (code) => {
			if (resolved) return;
			cleanup();
			reject(new Error(`Watch build exited before initial success with code ${code}`));
		};
		const onError = (error) => {
			if (resolved) return;
			cleanup();
			reject(error);
		};

		buildProcess.stdout?.on('data', onStdout);
		buildProcess.stderr?.on('data', onStderr);
		buildProcess.on('exit', onExit);
		buildProcess.on('error', onError);
	});
}

async function main() {
	console.log('Starting build watcher and waiting for the initial build...');
	const tsc = run('pnpm', ['run', 'build:watch']);
	await waitForInitialWatchBuild(tsc);

	const prepared = await prepareDevPackage({ projectRoot, userFolder });
	console.log(`Prepared ${prepared.devPackageDir}`);
	console.log(`Linked ${prepared.linkedPackageDir}`);
	console.log(`Using N8N_USER_FOLDER=${prepared.userFolder}`);

	const n8n = run(
		'pnpm',
		['exec', 'n8n'],
		{
			N8N_DEV_RELOAD: 'true',
			N8N_USER_FOLDER: userFolder,
			N8N_SECURE_COOKIE: 'false',
			DB_SQLITE_POOL_SIZE: '10',
			N8N_LOG_LEVEL: 'debug',
		},
		{
			piped: false,
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
