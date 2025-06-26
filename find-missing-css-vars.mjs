import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';
const EXTRA_DEF_DIRS = ['./node_modules/@navikt']; // kan legge til flere om ønsket
const INCLUDE_EXTENSIONS = ['.svelte', '.ts', '.js', '.css', '.scss'];

const USED_VAR_PATTERN = /var\(--([a-zA-Z0-9-_]+)\)/g;
const DEFINED_VAR_PATTERN = /--([a-zA-Z0-9-_]+)\s*:/g;
const STYLE_SET_PROP_PATTERN = /style\.setProperty\(\s*['"]--([a-zA-Z0-9-_]+)['"]/g;
const SVELTE_STYLE_BINDING_PATTERN = /style:--([a-zA-Z0-9-_]+)=/g;

const KNOWN_DYNAMIC_VARS = new Set(['bg-color', 'background', 'size']);

const usedVars = new Map(); // kun fra src/
const definedVars = new Set();

function walk(dir, callback) {
	for (const entry of fs.readdirSync(dir)) {
		const fullPath = path.join(dir, entry);
		if (fs.statSync(fullPath).isDirectory()) {
			walk(fullPath, callback);
		} else if (INCLUDE_EXTENSIONS.some((ext) => fullPath.endsWith(ext))) {
			callback(fullPath);
		}
	}
}

function analyzeUsedVars(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	for (const match of content.matchAll(USED_VAR_PATTERN)) {
		const varName = match[1];
		if (!usedVars.has(varName)) usedVars.set(varName, new Set());
		usedVars.get(varName).add(filePath);
	}
	for (const match of content.matchAll(STYLE_SET_PROP_PATTERN)) {
		const varName = match[1];
		if (!usedVars.has(varName)) usedVars.set(varName, new Set());
		usedVars.get(varName).add(filePath);
	}
	for (const match of content.matchAll(SVELTE_STYLE_BINDING_PATTERN)) {
		const varName = match[1];
		if (!usedVars.has(varName)) usedVars.set(varName, new Set());
		usedVars.get(varName).add(filePath);
	}
}

function analyzeDefinedVars(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	for (const match of content.matchAll(DEFINED_VAR_PATTERN)) {
		definedVars.add(match[1]);
	}
}

// 🚶 Gå gjennom src for bruk
walk(SRC_DIR, analyzeUsedVars);

// 🔁 Gå gjennom src og ekstra kataloger for definisjoner
walk(SRC_DIR, analyzeDefinedVars);
for (const dir of EXTRA_DEF_DIRS) {
	if (fs.existsSync(dir)) walk(dir, analyzeDefinedVars);
}

// 🔍 Rapporter kun mangler brukt i ./src
const missingVars = [];
for (const [varName, files] of usedVars.entries()) {
	if (!definedVars.has(varName) && !KNOWN_DYNAMIC_VARS.has(varName)) {
		missingVars.push({
			variable: `--${varName}`,
			usedIn: Array.from(files).join(', ')
		});
	}
}

// 🖨️ Resultat
if (missingVars.length === 0) {
	console.log('✅ Ingen manglende CSS-variabler brukt i src/');
} else {
	console.log('\n🚨 Manglende CSS-variabler brukt i src/:\n');
	for (const entry of missingVars) {
		console.log(`${entry.variable} brukt i: ${entry.usedIn}`);
	}
}
