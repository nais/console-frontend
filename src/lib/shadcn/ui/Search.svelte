<script lang="ts">
	import { MagnifyingGlassIcon, XMarkIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Label from './Label.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'size' | 'value' | 'type' | 'role'> {
		label: string;
		hideLabel?: boolean;
		clearButtonLabel?: string;
		clearButton?: boolean;
		variant?: 'primary' | 'secondary' | 'simple';
		description?: string;
		size?: 'medium' | 'small';
		value?: string;
		disabled?: boolean;
		loading?: boolean;
		searchIconText?: string;
		htmlSize?: number | string;
		onChange?: (value: string) => void;
		onSearchClick?: (value: string) => void;
		onclear?: (e: { event: MouseEvent | KeyboardEvent; trigger: 'Click' | 'Escape' }) => void;
		button?: Snippet;
		id?: string;
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		label,
		hideLabel = true,
		clearButtonLabel = 'Clear field',
		clearButton = true,
		size = 'medium',
		value = $bindable(''),
		disabled = false,
		htmlSize,
		onChange,
		onclear,
		id = `srch-${uid}`,
		class: className = '',
		oninput,
		...rest
	}: Props = $props();
</script>

<div class={['sh-search-field', className]}>
	<Label for={id} {size} visuallyHidden={hideLabel}>{label}</Label>
	<div class="sh-search-wrapper">
		<span class="sh-search-icon" aria-hidden="true">
			<MagnifyingGlassIcon />
		</span>
		<input
			type="search"
			{id}
			{disabled}
			size={typeof htmlSize === 'number' ? htmlSize : undefined}
			bind:value
			class={['sh-search-input', `sh-search-input--${size}`]}
			oninput={(e) => {
				onChange?.(e.currentTarget.value);
				if (typeof oninput === 'function') {
					oninput(e);
				}
			}}
			{...rest}
		/>
		{#if clearButton && value}
			<button
				type="button"
				class="sh-search-clear"
				aria-label={clearButtonLabel}
				onclick={(event) => {
					value = '';
					onChange?.('');
					onclear?.({ event, trigger: 'Click' });
				}}
			>
				<XMarkIcon aria-hidden="true" />
			</button>
		{/if}
	</div>
</div>

<style>
	.sh-search-field {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-6);
		width: 100%;
	}
	.sh-search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}
	.sh-search-icon {
		position: absolute;
		left: var(--ax-space-10);
		display: inline-flex;
		align-items: center;
		color: var(--muted-foreground);
		font-size: var(--sh-font-size-sm);
		pointer-events: none;
	}
	.sh-search-input {
		width: 100%;
		box-sizing: border-box;
		height: var(--ax-space-36);
		padding: 0 var(--ax-space-32) 0 var(--ax-space-32);
		border-radius: var(--radius-sm);
		border: var(--sh-border-width) solid var(--input);
		background-color: var(--card);
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--sh-font-size-sm);
		box-shadow: var(--sh-shadow-xs);
	}
	.sh-search-input--small {
		height: var(--ax-space-32);
		font-size: var(--sh-font-size-sm);
	}
	.sh-search-input:focus-visible {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 var(--ax-space-2) color-mix(in srgb, var(--ring) 22%, transparent);
	}
	.sh-search-clear {
		position: absolute;
		right: var(--ax-space-6);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--ax-space-24);
		height: var(--ax-space-24);
		border: none;
		border-radius: var(--radius-2xs);
		background: transparent;
		color: var(--muted-foreground);
		cursor: pointer;
	}
	.sh-search-clear:hover {
		background-color: var(--secondary);
		color: var(--foreground);
	}
</style>
