<script lang="ts">
	import { page } from '$app/state';
	import AppSidebar from '../../src/lib/shadcn/ui/AppSidebar.svelte';
	import Button from '../../src/lib/shadcn/ui/Button.svelte';
	import Theme from '../../src/lib/shadcn/ui/Theme.svelte';
	import { tenantNavigation } from '../../src/lib/tenantNavigation.js';

	const params = new URLSearchParams(window.location.search);
	let reconcilerErrors = $state(params.has('reconciler-errors'));
	const tenantItems = $derived(
		tenantNavigation(page.url.pathname, params.has('admin'), reconcilerErrors)
	);
	const features = params.has('features')
		? {
				unleash: { enabled: true },
				valkey: { enabled: true },
				kafka: { enabled: true },
				openSearch: { enabled: true }
			}
		: undefined;
	let mobileOpen = $state(false);
	let collapsed = $state(false);
</script>

<Theme theme={params.has('dark') ? 'dark' : 'light'}>
	<div class="mobile-trigger">
		<Button aria-haspopup="dialog" aria-expanded={mobileOpen} onclick={() => (mobileOpen = true)}>
			Open navigation
		</Button>
	</div>
	<AppSidebar {tenantItems} {features} bind:mobileOpen bind:collapsed />
	<Button>Outside navigation</Button>
	{#if params.has('reconciler-errors')}
		<Button onclick={() => (reconcilerErrors = false)}>Clear reconciler errors</Button>
	{/if}
</Theme>

<style>
	.mobile-trigger {
		display: none;
	}

	@media (max-width: 960px) {
		.mobile-trigger {
			display: block;
		}
	}
</style>
