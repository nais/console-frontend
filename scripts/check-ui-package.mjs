import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const { version } = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8'));
const temporary = mkdtempSync(join(tmpdir(), 'nais-ui-consumer-'));

function pnpm(args, cwd) {
	execFileSync('pnpm', args, { cwd, stdio: 'inherit' });
}

try {
	pnpm(['--dir', 'packages/ui', 'pack', '--pack-destination', temporary], root);
	const consumer = join(temporary, 'consumer');
	cpSync(resolve(root, 'tests/package-consumer'), consumer, { recursive: true });
	pnpm(
		[
			'add',
			'--ignore-workspace',
			'--store-dir',
			join(temporary, 'store'),
			join(temporary, `nais-ui-${version}.tgz`)
		],
		consumer
	);
	pnpm(['run', 'check'], consumer);
	pnpm(['run', 'build'], consumer);
	pnpm(['run', 'build:ssr'], consumer);
} finally {
	rmSync(temporary, { recursive: true, force: true });
}
