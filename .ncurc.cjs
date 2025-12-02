const { defineConfig } = require('npm-check-updates');

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
