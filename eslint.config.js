// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{ plugins: { unicorn: eslintPluginUnicorn } },
	{
		ignores: ['.ncurc.cjs']
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],

		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				svelteFeatures: {
					experimentalGenerics: true
				}
			}
		}
	},
	{
		rules: {
			'svelte/require-each-key': 'error',
			'svelte/valid-each-key': 'error',
			'unicorn/prefer-at': 'error',
			'svelte/no-navigation-without-resolve': 'off'
			/*'svelte/no-unused-class-name': 'error'*/
		}
	},
	storybook.configs['flat/recommended']
);
