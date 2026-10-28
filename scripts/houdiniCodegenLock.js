import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import lockfile from 'proper-lockfile';

const lockKey = Symbol.for(`nais.console.houdini.codegen-lock:${process.cwd()}`);
if (!Reflect.has(globalThis, lockKey)) {
	mkdirSync('.houdini', { recursive: true });
	try {
		const release = lockfile.lockSync(process.cwd(), {
			lockfilePath: resolve('.houdini/codegen.lock')
		});
		Reflect.set(globalThis, lockKey, release);
	} catch (error) {
		if (!(error instanceof Error) || !('code' in error) || error.code !== 'ELOCKED') throw error;
		throw new Error(
			'Another Houdini process is using this checkout. Stop the Console dev server before running code generation or pnpm check.',
			{ cause: error }
		);
	}
}
