#!/usr/bin/env node

import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Recursively find all files matching a pattern in a directory
 */
async function findFiles(dir, pattern) {
	const files = [];

	try {
		const entries = await readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dir, entry.name);

			// Skip node_modules and other common directories
			if (
				entry.isDirectory() &&
				!['node_modules', '.git', '.svelte-kit', 'build', '.houdini'].includes(entry.name)
			) {
				files.push(...(await findFiles(fullPath, pattern)));
			} else if (entry.isFile() && pattern.test(entry.name)) {
				files.push(fullPath);
			}
		}
	} catch (error) {
		console.error(`Error reading directory ${dir}:`, error);
	}

	return files;
}

/**
 * Extract the query/mutation/fragment name from a .gql file
 */
async function extractQueryName(filePath) {
	try {
		const content = await readFile(filePath, 'utf-8');

		// Match query, mutation, or fragment declarations
		// Examples: "query UserInfo {", "mutation UpdateUser {", "fragment UserDetails on User {"
		const match = content.match(/(?:query|mutation|fragment)\s+(\w+)/);

		return match ? match[1] : null;
	} catch (error) {
		console.error(`Error reading file ${filePath}:`, error);
		return null;
	}
}

/**
 * Check if a query name is imported or used in any TypeScript or Svelte files
 */
async function isQueryUsed(queryName, tsFiles, svelteFiles) {
	const allFiles = [...tsFiles, ...svelteFiles];

	// Houdini generates different export names based on the query type:
	// - Queries: load_QueryName
	// - Mutations: QueryName (as a store)
	// - Fragments: QueryNameFragment, fragment function with queryName
	const patterns = [
		// Load function (for queries in route files)
		new RegExp(`load_${queryName}\\b`),
		// Store imports (e.g., QueryNameStore)
		new RegExp(`\\b${queryName}Store\\b`),
		// Direct query/mutation name (for stores)
		new RegExp(`\\b${queryName}\\b`),
		// Fragment pattern
		new RegExp(`\\b${queryName}Fragment\\b`),
		// graphql tag usage with the query name
		new RegExp(`graphql\\([^)]*${queryName}[^)]*\\)`),
		// Type imports
		new RegExp(`type\\s+${queryName}\\$`),
		new RegExp(`${queryName}\\$result`),
		new RegExp(`${queryName}\\$input`),
		new RegExp(`${queryName}\\$data`)
	];

	for (const file of allFiles) {
		try {
			const content = await readFile(file, 'utf-8');

			// Check if any pattern matches
			if (patterns.some((pattern) => pattern.test(content))) {
				return true;
			}
		} catch (error) {
			console.error(`Error reading file ${file}:`, error);
		}
	}

	return false;
}

/**
 * Main function to find unused .gql files
 */
async function findUnusedGqlFiles() {
	const srcDir = join(__dirname, 'src');

	console.log('🔍 Scanning for .gql files in src directory...\n');

	// Find all .gql files
	const gqlFiles = await findFiles(srcDir, /\.gql$/);
	console.log(`Found ${gqlFiles.length} .gql files\n`);

	// Find all .ts and .svelte files
	console.log('🔍 Scanning for .ts and .svelte files...\n');
	const tsFiles = await findFiles(srcDir, /\.(ts|js)$/);
	const svelteFiles = await findFiles(srcDir, /\.svelte$/);
	console.log(`Found ${tsFiles.length} .ts/.js files and ${svelteFiles.length} .svelte files\n`);

	// Extract query names and check usage
	console.log('🔍 Checking usage of each GraphQL query...\n');
	const gqlFileInfo = [];

	for (const gqlFile of gqlFiles) {
		const queryName = await extractQueryName(gqlFile);

		if (!queryName) {
			console.warn(`⚠️  Could not extract query name from ${gqlFile}`);
			continue;
		}

		const isUsed = await isQueryUsed(queryName, tsFiles, svelteFiles);
		gqlFileInfo.push({
			path: gqlFile,
			queryName,
			isUsed
		});
	}

	// Report results
	const unusedFiles = gqlFileInfo.filter((f) => !f.isUsed);
	const usedFiles = gqlFileInfo.filter((f) => f.isUsed);

	console.log('═'.repeat(80));
	console.log('📊 RESULTS');
	console.log('═'.repeat(80));
	console.log();

	if (unusedFiles.length === 0) {
		console.log('✅ All .gql files are being used!');
	} else {
		console.log(`❌ Found ${unusedFiles.length} unused .gql file(s):\n`);

		for (const file of unusedFiles) {
			const relativePath = relative(__dirname, file.path);
			console.log(`  • ${relativePath}`);
			console.log(`    Query/Mutation/Fragment: ${file.queryName}\n`);
		}
	}

	console.log(`\n✅ ${usedFiles.length} .gql file(s) are in use`);

	// Optional: Show all files with their status
	if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
		console.log('\n' + '═'.repeat(80));
		console.log('📋 DETAILED LIST');
		console.log('═'.repeat(80));
		console.log();

		for (const file of gqlFileInfo) {
			const relativePath = relative(__dirname, file.path);
			const status = file.isUsed ? '✅' : '❌';
			console.log(`${status} ${relativePath} (${file.queryName})`);
		}
	}

	console.log('\n💡 Tip: Run with --verbose or -v flag to see all files');
}

// Run the script
findUnusedGqlFiles().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
