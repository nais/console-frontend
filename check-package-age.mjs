#!/usr/bin/env node

import { execSync } from 'child_process';

const args = process.argv.slice(2);

if (args.length < 2) {
	console.error('Usage: npm run check-age <package> <version>');
	console.error('Example: npm run check-age storybook 10.1.8');
	process.exit(1);
}

const [packageName, version] = args;

try {
	const output = execSync(`npm view ${packageName}@${version} time --json`, {
		encoding: 'utf-8'
	});

	const data = JSON.parse(output);
	// npm view returns an object with version keys, we need to get the specific version
	const releaseDate = new Date(data[version] || data);
	const ageInDays = Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));

	console.log(`\n📦 ${packageName}@${version}`);
	console.log(`📅 Released: ${releaseDate.toISOString().split('T')[0]}`);
	console.log(`⏱️  Age: ${ageInDays} days old`);

	if (ageInDays < 14) {
		console.log(`⚠️  WARNING: Less than 14 days old (cooldown not met)\n`);
	} else {
		console.log(`✅ Meets 14-day cooldown\n`);
	}
} catch (error) {
	console.error(`\n❌ Error checking ${packageName}@${version}:`, error.message);
	process.exit(1);
}
