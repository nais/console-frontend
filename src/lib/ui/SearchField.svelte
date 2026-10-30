<script lang="ts">
	import { MagnifyingGlassIcon } from '#lib/icons/index.js';
	const inputId = $props.id();

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
	<label for={inputId} class="sr-only">{label}</label>
	<div class="search-icon">
		<MagnifyingGlassIcon />
	</div>
	<input
		bind:this={inputEl}
		{value}
		id={inputId}
		type="text"
		class="search-input"
		{placeholder}
		autocomplete="off"
		onkeydown={handleKeydown}
		oninput={(e) => oninput?.(e.currentTarget.value)}
	/>
	{#if value}
		<button type="button" class="clear-button" aria-label="Clear search" onclick={clearValue}>
			&times;
		</button>
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
		left: 0.65rem;
		display: flex;
		align-items: center;
		pointer-events: none;
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}

	.search-input {
		width: 100%;
		height: 2.25rem;
		padding: 0 2rem 0 2.125rem;
		border: 1px solid var(--input);
		border-radius: calc(var(--radius) - 2px);
		background: var(--card);
		color: var(--foreground);
		font-family: inherit;
		font-size: 0.8125rem;
		line-height: 1.25rem;
		box-shadow: var(--sh-shadow-xs);
		box-sizing: border-box;
		outline: none;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	.search-input::placeholder {
		color: var(--muted-foreground);
	}

	.search-input:focus {
		border-color: var(--ring);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 18%, transparent);
	}

	.clear-button {
		position: absolute;
		right: 0.375rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.375rem;
		height: 1.375rem;
		padding: 0;
		border: none;
		border-radius: 0.25rem;
		background: transparent;
		color: var(--muted-foreground);
		font-size: 1rem;
		cursor: pointer;
		line-height: 1;
	}

	.clear-button:hover {
		background: var(--secondary);
		color: var(--foreground);
	}
</style>
