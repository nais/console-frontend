<svelte:options runes />

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Alert } from '@nais/ds-svelte-community';

	import { fade } from 'svelte/transition';
</script>

{#if page.url.searchParams.get('naisdevice') == 'connected' || page.url.searchParams.get('naisdevice') == '1'}
	<!-- A bug in naisdevice sends people to `?naisdevice=1`, we handle it the same way as `connected` for a while -->
	<div class="naisdevice" out:fade>
		<Alert
			variant="success"
			closeButton
			onclose={() => {
				const url = page.url;
				url.searchParams.delete('naisdevice');

				goto(page.url.toString(), { replaceState: true });
			}}
		>
			Naisdevice successfully connected.
		</Alert>
	</div>
{/if}

<style>
	.naisdevice {
		position: fixed;
		bottom: 0;
		right: 0;
		padding: var(--ax-space-8, --a-spacing-2);
	}
</style>
