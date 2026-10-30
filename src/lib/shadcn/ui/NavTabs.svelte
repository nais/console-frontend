<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	export interface TabItem {
		value: string;
		label: string;
		href?: string;
		icon?: Component;
		badge?: string | number;
	}

	interface Props {
		items: readonly TabItem[];
		value?: string;
		activeValue?: string;
		variant?: 'pill' | 'line';
		ariaLabel?: string;
		class?: string;
		onchange?: (value: string) => void;
		children?: Snippet;
	}

	let {
		items,
		value = '',
		activeValue,
		variant = 'line',
		ariaLabel = 'Section navigation',
		class: className = '',
		onchange,
		children
	}: Props = $props();

	let currentVal = $derived(activeValue ?? value);
</script>

<div class="sh-tabs-root {className}">
	<nav class="sh-tabs-list variant-{variant}" aria-label={ariaLabel}>
		{#each items as item (item.value)}
			{const isActive = $derived(item.value === currentVal)}
			{#if item.href}
				<a
					href={item.href}
					class="sh-tab-trigger"
					class:active={isActive}
					aria-current={isActive ? 'page' : undefined}
				>
					{#if item.icon}
						{const Icon = $derived(item.icon)}
						<span class="tab-icon"><Icon aria-hidden="true" /></span>
					{/if}
					<span>{item.label}</span>
					{#if item.badge !== undefined}
						<span class="tab-badge">{item.badge}</span>
					{/if}
				</a>
			{:else}
				<button
					type="button"
					class="sh-tab-trigger"
					class:active={isActive}
					aria-pressed={isActive}
					onclick={() => onchange?.(item.value)}
				>
					{#if item.icon}
						{const Icon = $derived(item.icon)}
						<span class="tab-icon"><Icon aria-hidden="true" /></span>
					{/if}
					<span>{item.label}</span>
					{#if item.badge !== undefined}
						<span class="tab-badge">{item.badge}</span>
					{/if}
				</button>
			{/if}
		{/each}
	</nav>

	{#if children}
		<div class="sh-tabs-content">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.sh-tabs-root {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		min-width: 0;
	}

	.sh-tabs-list {
		display: flex;
		align-items: center;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.sh-tabs-list::-webkit-scrollbar {
		display: none;
	}

	/* Line variant (modern Vercel/Linear style) */
	.sh-tabs-list.variant-line {
		gap: 0.25rem;
		border-bottom: 1px solid var(--border);
		padding-bottom: 0;
	}

	.variant-line .sh-tab-trigger {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.625rem 0.875rem;
		font-size: 0.84375rem;
		font-weight: 500;
		color: var(--muted-foreground);
		text-decoration: none;
		background: transparent;
		border: none;
		border-radius: calc(var(--radius) - 3px) calc(var(--radius) - 3px) 0 0;
		white-space: nowrap;
		cursor: pointer;
		transition:
			color 130ms ease,
			background-color 130ms ease;
	}

	.variant-line .sh-tab-trigger:hover {
		color: var(--foreground);
		background-color: var(--secondary);
	}

	.variant-line .sh-tab-trigger.active {
		color: var(--foreground);
		font-weight: 600;
	}

	.variant-line .sh-tab-trigger.active::after {
		content: '';
		position: absolute;
		left: 0.5rem;
		right: 0.5rem;
		bottom: -1px;
		height: 2px;
		border-radius: 2px 2px 0 0;
		background: var(--primary);
	}

	/* Pill variant (shadcn TabsList style) */
	.sh-tabs-list.variant-pill {
		display: inline-flex;
		width: fit-content;
		max-width: 100%;
		padding: 0.25rem;
		gap: 0.2rem;
		background-color: var(--secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.variant-pill .sh-tab-trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--muted-foreground);
		text-decoration: none;
		background: transparent;
		border: none;
		border-radius: calc(var(--radius) - 3px);
		white-space: nowrap;
		cursor: pointer;
		transition:
			color 130ms ease,
			background-color 130ms ease,
			box-shadow 130ms ease;
	}

	.variant-pill .sh-tab-trigger:hover {
		color: var(--foreground);
	}

	.variant-pill .sh-tab-trigger.active {
		background-color: var(--card);
		color: var(--foreground);
		font-weight: 600;
		box-shadow: var(--sh-shadow-xs);
	}

	.tab-icon {
		display: inline-flex;
		align-items: center;
		font-size: 0.95em;
		opacity: 0.8;
	}

	.sh-tab-trigger.active .tab-icon {
		color: var(--primary);
		opacity: 1;
	}

	.tab-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.125rem;
		padding: 0 0.35rem;
		font-size: 0.6875rem;
		font-weight: 600;
		border-radius: 9999px;
		background-color: var(--secondary);
		color: var(--muted-foreground);
		font-variant-numeric: tabular-nums;
	}

	.sh-tab-trigger.active .tab-badge {
		background-color: var(--primary-muted);
		color: var(--primary);
	}

	.sh-tabs-content {
		min-width: 0;
	}
</style>
