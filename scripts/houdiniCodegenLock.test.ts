import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

const lockUrl = new URL('./houdiniCodegenLock.js', import.meta.url).href;
const acquireLock = `await import(${JSON.stringify(lockUrl)});`;

it('rejects a competing generator and releases the checkout when its owner exits', async () => {
	const cwd = await mkdtemp(join(tmpdir(), 'console-houdini-lock-'));
	const owner = spawn(
		process.execPath,
		['--input-type=module', '-e', `${acquireLock} console.log('ready'); process.stdin.resume();`],
		{ cwd, stdio: ['pipe', 'pipe', 'pipe'] }
	);
	try {
		await new Promise<void>((resolve, reject) => {
			owner.stdout.once('data', () => resolve());
			owner.once('error', reject);
			owner.once('exit', (code) => reject(new Error(`Lock owner exited early: ${code}`)));
		});
		const contender = spawnSync(process.execPath, ['--input-type=module', '-e', acquireLock], {
			cwd,
			encoding: 'utf8',
			timeout: 5000
		});
		expect(contender.status).not.toBe(0);
		expect(contender.stderr).toContain('Another Houdini process is using this checkout');
	} finally {
		if (owner.exitCode === null && owner.signalCode === null) {
			const exited = once(owner, 'exit');
			owner.stdin.end();
			await exited;
		}
		try {
			const next = spawnSync(process.execPath, ['--input-type=module', '-e', acquireLock], {
				cwd,
				encoding: 'utf8',
				timeout: 5000
			});
			expect(next.status, next.stderr).toBe(0);
		} finally {
			await rm(cwd, { recursive: true, force: true });
		}
	}
});

it('allows config reloads in the owning process', async () => {
	const cwd = await mkdtemp(join(tmpdir(), 'console-houdini-lock-'));
	try {
		const result = spawnSync(
			process.execPath,
			[
				'--input-type=module',
				'-e',
				`${acquireLock} await import(${JSON.stringify(`${lockUrl}?reload`)});`
			],
			{ cwd, encoding: 'utf8', timeout: 5000 }
		);
		expect(result.status, result.stderr).toBe(0);
	} finally {
		await rm(cwd, { recursive: true, force: true });
	}
});
