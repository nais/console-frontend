#!/usr/bin/env node

import { spawn, execFileSync } from 'child_process';
import * as readline from 'readline';
const version = process.argv[2];

if (!version) {
	console.error('Error: Please provide a Storybook version');
	console.error('Usage: npm run upgrade-storybook <version>');
	console.error('Example: npm run upgrade-storybook 10.1.11');
	process.exit(1);
}

// Validate that the version exists
try {
	console.log(`🔍 Validating storybook@${version} exists...`);
	const output = execFileSync('npm', ['view', `storybook@${version}`, 'time', '--json'], {
		encoding: 'utf-8',
		stdio: ['ignore', 'pipe', 'pipe']
	});
	console.log('✓ Version exists\n');

	// Check 14-day cooldown policy
	const data = JSON.parse(output);
	const releaseDate = new Date(data[version] || data);
	const ageInDays = Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));

	console.log(`📦 storybook@${version}`);
	console.log(`📅 Released: ${releaseDate.toISOString().split('T')[0]}`);
	console.log(`⏱️  Age: ${ageInDays} days old`);

	if (ageInDays < 14) {
		console.log(`\n⚠️  WARNING: This version is less than 14 days old!`);
		console.log(`⚠️  The 14-day cooldown policy is not met.`);
		console.log(`⚠️  Consider waiting to reduce the risk of compromised packages.\n`);

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		const answer = await new Promise((resolve) => {
			rl.question('Do you want to continue anyway? (y/N): ', (answer) => {
				rl.close();
				resolve(answer);
			});
		});

		if (answer.toLowerCase() !== 'y') {
			console.log('\n❌ Upgrade cancelled.');
			process.exit(0);
		}
		console.log('');
	} else {
		console.log(`✓ Meets 14-day cooldown\n`);
	}
} catch (error) {
	console.error(`\n❌ Error: storybook@${version} does not exist or cannot be found`);
	console.error('Please check the version number and try again.');
	if (error.message) {
		console.error(`\nDebug info: ${error.message}`);
	}
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

		proc.on('error', (error) => {
			reject(new Error(`Failed to start command: ${error.message}`));
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
