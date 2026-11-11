<script lang="ts">
	import { XMarkIcon } from '#lib/icons/index.js';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLButtonAttributes, 'value' | 'children'> {
		value: string;
		removeLabel?: string;
	}

	let { value, removeLabel = 'Remove', class: className = '', ...rest }: Props = $props();
</script>

<li class="sh-chip-li">
	<button
		type="button"
		class={['sh-removable-chip', className]}
		aria-label={`${removeLabel}: ${value}`}
		{...rest}
	>
		<span>{value}</span>
		<XMarkIcon aria-hidden="true" />
	</button>
</li>

<style>
	.sh-chip-li {
		display: inline-flex;
		min-width: 0;
		max-width: 100%;
	}

	.sh-removable-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		padding: var(--ax-space-4) var(--ax-space-8);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius-full);
		background: var(--secondary);
		color: var(--secondary-foreground);
		font: inherit;
		max-width: 100%;
		white-space: normal;
		cursor: pointer;
	}

	.sh-removable-chip span {
		overflow-wrap: anywhere;
		min-width: 0;
	}

	.sh-removable-chip :global(svg) {
		width: var(--ax-space-16);
		height: var(--ax-space-16);
		flex-shrink: 0;
	}

	.sh-removable-chip:hover {
		background: var(--accent);
		color: var(--accent-foreground);
	}

	.sh-removable-chip:focus-visible {
		outline: var(--ax-space-2) solid var(--ring);
		outline-offset: var(--ax-space-2);
	}
</style>
