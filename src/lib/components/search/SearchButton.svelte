<script lang="ts">
	import { Button } from '@nais/ds-svelte-community';
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

<Button
	size="small"
	icon={MagnifyingGlassIcon}
	variant="primary-neutral"
	onclick={() => (open = true)}
>
	<div class="hotkey">
		{isMac ? '⌘' : 'Ctrl'}-K
	</div>
</Button>
{#if open}
	<SearchModal bind:open />
{/if}

<style>
	.hotkey {
		font-size: var(--a-font-size-small);
		font-weight: var(--a-font-weight-regular);
		color: var(--a-gray-200);
		padding-top: 2px;
	}
</style>
