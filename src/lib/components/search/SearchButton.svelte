<script lang="ts">
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import { Theme } from '@nais/ds-svelte-community';
	import { InternalHeaderButton } from '@nais/ds-svelte-community/experimental';
	import { MagnifyingGlassIcon } from '@nais/ds-svelte-community/icons';
	import SearchModal from './SearchModal.svelte';

	let open = $state(false);

	const isMac = navigator.platform === 'MacIntel';

	const onkeydown = (e: KeyboardEvent) => {
		if (e.key === 'k' && ((isMac && e.metaKey) || (!isMac && e.ctrlKey))) {
			e.preventDefault();
			open = true;
		}
	};
</script>

<svelte:document {onkeydown} />

<InternalHeaderButton onclick={() => (open = true)}>
	<MagnifyingGlassIcon />
	<div class="hotkey">
		{isMac ? '⌘' : 'Ctrl'}-K
	</div>
</InternalHeaderButton>
{#if open}
	<Theme theme={themeSwitch.theme}>
		<SearchModal bind:open />
	</Theme>
{/if}

<style>
	.hotkey {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-regular);
		color: var(--ax-text-neutral);
		padding-top: 2px;
	}
</style>
