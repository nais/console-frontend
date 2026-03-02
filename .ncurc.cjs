const { defineConfig } = require('npm-check-updates');

/**
 * npm-check-updates configuration with security-focused cooldown period.
 *
 * Optional tooling for manual dependency checks. Primary project enforcement
 * uses check-updates-cooldown.mjs scripts.
 *
 * Note: @nais/ds-svelte-community is intentionally exempt from cooldown.
 */
module.exports = defineConfig({
	cooldown: (packageName) => {
		// Skip cooldown for trusted internal package
		if (packageName === '@nais/ds-svelte-community') {
			return 0;
		}
		// Apply 14-day cooldown for all other packages
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
