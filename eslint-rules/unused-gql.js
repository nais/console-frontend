import fs from 'node:fs';
import path from 'node:path';

const SKIP_DIRECTORIES = new Set(['node_modules', '.git', '.svelte-kit', 'build', '.houdini']);

async function findFiles(dir, pattern) {
	const files = [];

	if (!fs.existsSync(dir)) {
		return files;
	}

	const entries = await fs.promises.readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (SKIP_DIRECTORIES.has(entry.name)) {
				continue;
			}
			files.push(...(await findFiles(fullPath, pattern)));
			continue;
		}

		if (entry.isFile() && pattern.test(entry.name)) {
			files.push(fullPath);
		}
	}

	return files;
}

async function extractQueryName(filePath) {
	const content = await fs.promises.readFile(filePath, 'utf-8');
	const match = content.match(/(?:query|mutation|fragment)\s+(\w+)/);
	return match ? match[1] : null;
}

async function isQueryUsed(queryName, tsFiles, svelteFiles) {
	const allFiles = [...tsFiles, ...svelteFiles];
	const patterns = [
		new RegExp(`load_${queryName}\\b`),
		new RegExp(`\\b${queryName}Store\\b`),
		new RegExp(`\\b${queryName}\\b`),
		new RegExp(`\\b${queryName}Fragment\\b`),
		new RegExp(`graphql\\([^)]*${queryName}[^)]*\\)`),
		new RegExp(`type\\s+${queryName}\\$`),
		new RegExp(`${queryName}\\$result`),
		new RegExp(`${queryName}\\$input`),
		new RegExp(`${queryName}\\$data`)
	];

	for (const file of allFiles) {
		const content = await fs.promises.readFile(file, 'utf-8');
		if (patterns.some((pattern) => pattern.test(content))) {
			return true;
		}
	}

	return false;
}

async function collectUnusedGqlFiles(projectRoot) {
	const srcDir = path.join(projectRoot, 'src');
	const gqlFiles = await findFiles(srcDir, /\.gql$/);
	const tsFiles = await findFiles(srcDir, /\.(ts|js)$/);
	const svelteFiles = await findFiles(srcDir, /\.svelte$/);

	const unusedFiles = [];

	for (const gqlFile of gqlFiles) {
		const queryName = await extractQueryName(gqlFile);
		if (!queryName) {
			continue;
		}

		const used = await isQueryUsed(queryName, tsFiles, svelteFiles);
		if (!used) {
			unusedFiles.push({
				path: path.relative(projectRoot, gqlFile),
				queryName
			});
		}
	}

	return unusedFiles.sort((a, b) => a.path.localeCompare(b.path));
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Report GraphQL files in src that are not referenced'
		},
		schema: []
	},

	create(context) {
		const filename = context.filename ?? context.getFilename?.() ?? '';
		const projectRoot = path.dirname(filename);

		if (path.basename(filename) !== 'eslint.config.js') {
			return {};
		}

		return {
			async 'Program:exit'() {
				const unusedFiles = await collectUnusedGqlFiles(projectRoot);

				for (const file of unusedFiles) {
					context.report({
						loc: { line: 1, column: 0 },
						message: `${file.path} appears unused (GraphQL operation: ${file.queryName})`
					});
				}
			}
		};
	}
};
