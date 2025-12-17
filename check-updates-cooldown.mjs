#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { gt, coerce } from 'semver';

const COOLDOWN_DAYS = 14;
const EXCLUDE_PACKAGES = ['@nais/ds-svelte-community'];
const SHOULD_INSTALL = process.argv.includes('--install');

// Packages that require special upgrade commands
const SPECIAL_UPGRADES = {
	storybook: (version) => `npx storybook@${version} upgrade`
};

function getCooldownDate() {
	const date = new Date();
	date.setDate(date.getDate() - COOLDOWN_DAYS);
	return date;
}

function getPackageVersionsWithDates(packageName) {
	try {
		const output = execSync(`npm view ${packageName} time --json`, {
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'ignore']
		});
		const times = JSON.parse(output);

		// Remove special keys
		delete times.created;
		delete times.modified;

		return times;
	} catch (error) {
		console.error(`  ⚠️  Error fetching ${packageName}:`, error.message);
		return null;
	}
}

function findNewestEligibleVersion(currentVersion, packageName) {
	const versionTimes = getPackageVersionsWithDates(packageName);
	if (!versionTimes) return null;

	const cooldownDate = getCooldownDate();
	const eligibleVersions = [];

	for (const [version, timeStr] of Object.entries(versionTimes)) {
		const releaseDate = new Date(timeStr);

		// Skip if too new
		if (releaseDate > cooldownDate) continue;

		// Skip pre-releases unless current version is also pre-release
		if (version.includes('-') && !currentVersion.includes('-')) continue;

		// Skip if not newer than current
		const coercedVersion = coerce(version);
		const coercedCurrent = coerce(currentVersion);
		if (!coercedVersion || !coercedCurrent) continue;
		if (!gt(coercedVersion.version, coercedCurrent.version)) continue;

		eligibleVersions.push({
			version,
			releaseDate,
			age: Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24))
		});
	}

	// Sort by version (newest first)
	eligibleVersions.sort((a, b) => {
		const vA = coerce(a.version);
		const vB = coerce(b.version);
		if (!vA || !vB) return 0;
		return gt(vA, vB) ? -1 : 1;
	});

	return eligibleVersions[0] || null;
}

function checkDependencies(deps, type) {
	if (!deps) return [];

	const updates = [];
	const packages = Object.entries(deps).filter(([name]) => !EXCLUDE_PACKAGES.includes(name));

	console.log(`\n📦 Checking ${packages.length} ${type}...\n`);

	for (const [packageName, currentRange] of packages) {
		// Extract version from range (e.g., "^1.2.3" -> "1.2.3")
		const currentVersion = currentRange.replace(/^[\^~>=<]/, '');

		process.stdout.write(`  ${packageName}@${currentVersion} ... `);

		const update = findNewestEligibleVersion(currentVersion, packageName);

		if (update) {
			console.log(`✨ ${update.version} (${update.age} days old)`);
			updates.push({
				packageName,
				currentVersion: currentRange,
				newVersion: update.version,
				age: update.age
			});
		} else {
			console.log('✓');
		}
	}

	return updates;
}

async function main() {
	console.log(`🔍 Checking for updates with ${COOLDOWN_DAYS}-day cooldown...\n`);
	console.log(
		`📅 Only considering versions released before ${getCooldownDate().toISOString().split('T')[0]}\n`
	);

	const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

	const depUpdates = checkDependencies(packageJson.dependencies, 'dependencies');
	const devDepUpdates = checkDependencies(packageJson.devDependencies, 'devDependencies');

	const allUpdates = [...depUpdates, ...devDepUpdates];

	if (allUpdates.length === 0) {
		console.log('\n✅ All packages are up to date (within cooldown period)!\n');
		return;
	}

	console.log('\n📋 Summary of available updates:\n');
	allUpdates.forEach(({ packageName, currentVersion, newVersion, age }) => {
		console.log(`  ${packageName}: ${currentVersion} → ${newVersion} (${age} days old)`);
	});

	if (SHOULD_INSTALL) {
		console.log('\n🔄 Installing updates...\n');

		// Group storybook-related packages
		const storybookUpdates = allUpdates.filter(
			({ packageName }) => packageName === 'storybook' || packageName.startsWith('@storybook/')
		);
		const otherUpdates = allUpdates.filter(
			({ packageName }) => packageName !== 'storybook' && !packageName.startsWith('@storybook/')
		);

		// Handle Storybook updates as a group
		if (storybookUpdates.length > 0) {
			const storybookVersion = storybookUpdates.find(
				(u) => u.packageName === 'storybook'
			)?.newVersion;
			if (storybookVersion) {
				const command = `npx storybook@${storybookVersion} upgrade`;
				console.log(
					`📦 Running Storybook upgrade (updates ${storybookUpdates.length} packages): ${command}...`
				);
				try {
					execSync(command, { stdio: 'inherit' });
					console.log(`✅ Storybook upgraded successfully to ${storybookVersion}\n`);
				} catch (error) {
					console.error(`❌ Failed to upgrade Storybook:`, error.message, '\n');
				}
			} else {
				console.log(
					`⚠️  Skipping @storybook/* packages - main 'storybook' package not in update list\n`
				);
			}
		}

		// Handle other updates
		for (const { packageName, newVersion } of otherUpdates) {
			const specialUpgrade = SPECIAL_UPGRADES[packageName];

			if (specialUpgrade) {
				const command = specialUpgrade(newVersion);
				console.log(`📦 Running special upgrade: ${command}...`);
				try {
					execSync(command, { stdio: 'inherit' });
					console.log(`✅ ${packageName}@${newVersion} upgraded successfully\n`);
				} catch (error) {
					console.error(`❌ Failed to upgrade ${packageName}@${newVersion}:`, error.message, '\n');
				}
			} else {
				console.log(`📦 Installing ${packageName}@${newVersion}...`);
				try {
					execSync(`npx npq install ${packageName}@${newVersion}`, {
						stdio: 'inherit'
					});
					console.log(`✅ ${packageName}@${newVersion} installed successfully\n`);
				} catch (error) {
					console.error(`❌ Failed to install ${packageName}@${newVersion}:`, error.message, '\n');
				}
			}
		}

		console.log('✨ All updates completed!\n');
	} else {
		console.log(`\n💡 To update manually:`);

		// Group storybook packages in dry-run output too
		const storybookUpdates = allUpdates.filter(
			({ packageName }) => packageName === 'storybook' || packageName.startsWith('@storybook/')
		);
		const otherUpdates = allUpdates.filter(
			({ packageName }) => packageName !== 'storybook' && !packageName.startsWith('@storybook/')
		);

		if (storybookUpdates.length > 0) {
			const storybookVersion = storybookUpdates.find(
				(u) => u.packageName === 'storybook'
			)?.newVersion;
			if (storybookVersion) {
				console.log(
					`   npx storybook@${storybookVersion} upgrade  # Updates ${storybookUpdates.length} storybook packages`
				);
			}
		}

		otherUpdates.forEach(({ packageName, newVersion }) => {
			const specialUpgrade = SPECIAL_UPGRADES[packageName];
			if (specialUpgrade) {
				console.log(`   ${specialUpgrade(newVersion)}`);
			} else {
				console.log(`   npx npq install ${packageName}@${newVersion}`);
			}
		});
		console.log(`\n   Or run: npm run update-outdated\n`);
	}
}

main().catch(console.error);
