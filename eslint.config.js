import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	prettier,
	...svelte.configs['flat/prettier'],
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		rules: {
			'svelte/require-each-key': 'error',
			'svelte/valid-each-key': 'error'
		}
	},
	{
		ignores: ['build/*', '.svelte-kit/*', 'dist/*', 'yarn.lock', '$houdini/*']
	}
];

/*
'svelte/prefer-destructured-store-props': 'error',
'svelte/no-target-blank': 'error',
'svelte/no-immutable-reactive-statements': 'error',
'svelte/prefer-style-directive': 'error',
'svelte/no-reactive-literals': 'error'
'svelte/no-useless-mustaches': 'error',
'svelte/no-goto-without-base': 'error',
'svelte/sort-attributes': 'error',
'svelte/prefer-destructured-store-props': 'error',
'svelte/html-closing-bracket-new-line': 'error',
'svelte/prefer-style-directive': 'error',
'svelte/no-useless-mustaches': 'error',
'svelte/no-inline-styles': 'error',
'svelte/html-closing-bracket-new-line': 'error',
'svelte/prefer-style-directive': 'error'*/
