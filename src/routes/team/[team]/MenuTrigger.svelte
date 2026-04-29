<script lang="ts">
	import { Button } from '@nais/ds-svelte-community';
	import { MenuHamburgerIcon } from '@nais/ds-svelte-community/icons';
	import { getTeamContext } from './teamContext.svelte';

	const teamContext = getTeamContext();
</script>

<Button
	variant="tertiary-neutral"
	size="small"
	icon={MenuHamburgerIcon}
	class="mobile-menu-trigger"
	type="button"
	aria-label="Open team navigation"
	aria-controls="team-menu-items"
	aria-expanded={teamContext.mobileMenuOpen}
	onclick={() => teamContext.openMobileMenu()}
/>

<style>
	:global(.mobile-menu-trigger) {
		display: none;
		flex-shrink: 0;
	}

	@media (max-width: 768px), (max-height: 500px) {
		:global(.mobile-menu-trigger) {
			display: inline-flex;
		}
	}
</style>
