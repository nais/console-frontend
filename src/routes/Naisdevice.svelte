<script module>
	import { page } from '$app/state';
	export function isNaisdevice() {
		return (
			// A bug in naisdevice sends people to `?naisdevice=1`, we handle it the same way as `connected` for a while
			page.url.searchParams.get('naisdevice') == 'connected' ||
			page.url.searchParams.get('naisdevice') == '1'
		);
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/authentication';

	import { CheckmarkCircleIcon, XMarkIcon } from '@nais/ds-svelte-community/icons';
	import { fade } from 'svelte/transition';
</script>

{#if isNaisdevice() && $isAuthenticated}
	<div class="naisdevice" out:fade>
		<div class="naisdevice-banner">
			<CheckmarkCircleIcon />
			<span>Naisdevice successfully connected.</span>
			<button
				type="button"
				class="close-button"
				onclick={() => {
					const url = page.url;
					url.searchParams.delete('naisdevice');
					goto(url.toString(), { replaceState: true });
				}}
				aria-label="Close"
			>
				<XMarkIcon />
			</button>
		</div>
	</div>
{/if}

<style>
	.naisdevice {
		position: fixed;
		bottom: 0;
		right: 0;
		padding: var(--ax-space-8);
		z-index: 1000;
	}

	.naisdevice-banner {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
		padding: var(--ax-space-20) var(--ax-space-32);
		background: var(--ax-bg-success-moderate);
		color: var(--ax-text-success-subtle);
		border-radius: var(--ax-radius-8);
		font-size: var(--ax-font-size-xlarge);
		font-weight: 700;
		box-shadow: none;
	}

	.naisdevice-banner :global(svg) {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
	}

	.naisdevice-banner span {
		flex: 1;
	}

	.close-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--ax-space-4);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--ax-text-success-subtle);
		border-radius: var(--ax-radius-4);
		transition: background-color 0.2s;
	}

	.close-button:hover {
		background-color: color-mix(in srgb, var(--ax-bg-success-moderate) 60%, transparent);
	}

	.close-button :global(svg) {
		width: 20px;
		height: 20px;
	}
</style>
