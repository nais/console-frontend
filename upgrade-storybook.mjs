#!/usr/bin/env node

import { spawn } from 'node:child_process';

const version = process.argv[2];

if (!version) {
	console.error('Error: Please provide a Storybook version');
	console.error('Usage: npm run upgrade-storybook <version>');
	console.error('Example: npm run upgrade-storybook 10.1.11');
	process.exit(1);
}

const commands = [
	{ cmd: 'npx', args: [`storybook@${version}`, 'upgrade'] },
	{ cmd: 'npm', args: ['run', 'format'] },
	{ cmd: 'npx', args: ['prettier', '--write', 'package-lock.json'] }
];

async function runCommand(cmd, args) {
	return new Promise((resolve, reject) => {
		console.log(`\n▶ Running: ${cmd} ${args.join(' ')}`);
		const proc = spawn(cmd, args, {
			stdio: 'inherit'
		});

		proc.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Command failed with exit code ${code}`));
			}
		});
	});
}

async function main() {
	console.log(`🚀 Upgrading Storybook to version ${version}...\n`);

	for (const { cmd, args } of commands) {
		try {
			await runCommand(cmd, args);
		} catch (error) {
			console.error(`\n❌ ${error.message}`);
			process.exit(1);
		}
	}

	console.log('\n✅ Storybook upgrade complete!');
}

main();
