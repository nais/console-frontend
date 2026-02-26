const { defineConfig } = require('npm-check-updates');

/**
 * npm-check-updates configuration with security-focused cooldown period.
 *
 * Optional tooling for manual dependency checks. Primary project enforcement
 * uses check-updates-cooldown.mjs scripts.
 */
module.exports = defineConfig({
	cooldown: (packageName) => {
		if (packageName === '@nais/ds-svelte-community') {
			return 0;
		}
		return 14;
	},
	target: 'latest',
	peer: true,
	dep: ['prod', 'dev', 'optional'],
	deprecated: false,
	pre: 0,
	enginesNode: true,
	install: 'never'
});
