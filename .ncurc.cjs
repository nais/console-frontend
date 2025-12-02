const { defineConfig } = require('npm-check-updates');

/**
 * npm-check-updates configuration with security-focused cooldown period.
 *
 * The 14-day cooldown helps protect against supply chain attacks by requiring
 * package versions to be published for at least 14 days before considering them
 * for upgrade. This provides time for the community to identify and report any
 * security issues or malicious code in newly published versions.
 *
 * Note: The cooldown is skipped for @nais/ds-svelte-community as it's a trusted
 * internal package maintained by the NAIS team.
 */
module.exports = defineConfig({
	cooldown: (packageName) => {
		// Skip cooldown for @nais/ds-svelte-community (trusted internal package)
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
