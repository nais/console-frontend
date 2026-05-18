<script lang="ts">
	import { MagnifyingGlassIcon } from '@nais/ds-svelte-community/icons';

	const {
		value = '',
		placeholder = 'Search...',
		label = 'Search',
		onsubmit,
		onclear,
		oninput
	}: {
		value?: string;
		placeholder?: string;
		label?: string;
		onsubmit?: () => void;
		onclear?: () => void;
		oninput?: (value: string) => void;
	} = $props();

	let inputEl: HTMLInputElement | undefined = $state();

	function clearValue() {
		if (inputEl) inputEl.value = '';
		oninput?.('');
		onclear?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && value) {
			clearValue();
			e.preventDefault();
		}
	}
</script>

<form
	class="search-field"
	role="search"
	onsubmit={(e) => {
		e.preventDefault();
		onsubmit?.();
	}}
>
	<label for="search-input" class="sr-only">{label}</label>
	<div class="search-icon">
		<MagnifyingGlassIcon />
	</div>
	<input
		bind:this={inputEl}
		{value}
		id="search-input"
		type="text"
		class="search-input"
		{placeholder}
		autocomplete="off"
		onkeydown={handleKeydown}
		oninput={(e) => oninput?.(e.currentTarget.value)}
	/>
	{#if value}
		<button type="button" class="clear-button" onclick={clearValue}> &times; </button>
	{/if}
</form>

<style>
	.search-field {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		display: flex;
		align-items: center;
		pointer-events: none;
		color: var(--ax-text-neutral);
		font-size: 1.125rem;
	}

	.search-input {
		width: 100%;
		padding: 0.5rem 2.25rem 0.5rem 2.5rem;
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-8);
		background: var(--ax-bg-default);
		color: var(--ax-text-neutral);
		font-size: var(--ax-font-size-medium);
		line-height: 1.5;
		outline: none;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	.search-input::placeholder {
		color: var(--ax-text-neutral);
	}

	.search-input:focus {
		border-color: var(--ax-text-neutral);
		box-shadow: 0 0 0 1px var(--ax-text-neutral);
	}

	.clear-button {
		position: absolute;
		right: 0.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border: none;
		border-radius: var(--ax-radius-4);
		background: transparent;
		color: var(--ax-text-neutral-subtle);
		font-size: 1.125rem;
		cursor: pointer;
		line-height: 1;
	}

	.clear-button:hover {
		background: var(--ax-neutral-200);
		color: var(--ax-text-neutral);
	}
</style>
