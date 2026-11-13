<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	const {
		title,
		icon: Icon,
		count,
		headerless = false,
		headerBorder = true,
		level = 'h2',
		size = 'medium',
		children,
		menu,
		search,
		filters,
		actions
	}: {
		title?: string;
		icon?: Component;
		count?: number;
		headerless?: boolean;
		headerBorder?: boolean;
		level?: 'h1' | 'h2' | 'h3' | 'h4';
		size?: 'medium' | 'small';
		children: Snippet;
		menu?: Snippet;
		search?: Snippet;
		filters?: Snippet;
		actions?: Snippet;
	} = $props();
</script>

<div class="collection" class:headerless>
	{#if !headerless}
		<header class={['header', { 'without-border': !headerBorder }]}>
			<div class="header-row">
				<div class="header-left">
					{#if title}
						<svelte:element this={level} class="title" class:small={size === 'small'}>
							{#if Icon}
								<Icon aria-hidden="true" />
							{/if}
							{title}
						</svelte:element>
					{/if}
					{#if count !== undefined}
						<span class="count-badge">{count}</span>
					{/if}
				</div>
				<div class="header-right">
					{#if actions}
						{@render actions()}
					{/if}
					{#if search}
						<div class="search-slot">
							{@render search()}
						</div>
					{/if}
				</div>
			</div>
			{#if filters || menu}
				<div class="toolbar">
					{#if filters}
						<div class="filters-slot">
							{@render filters()}
						</div>
					{/if}
					{#if menu}
						<div class="menu-slot">{@render menu()}</div>
					{/if}
				</div>
			{/if}
		</header>
	{/if}
	<div class="content">
		{@render children()}
	</div>
</div>

<style>
	.collection {
		display: flex;
		flex-direction: column;
		min-width: 0;
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--sh-shadow-xs);
		overflow: hidden;
	}

	.header {
		display: flex;
		flex-direction: column;
		padding: var(--nais-space-16) var(--nais-space-20);
		gap: var(--nais-space-12);
		border-bottom: 1px solid var(--border);
		background-color: var(--card);
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--nais-space-16);
	}

	.header.without-border {
		border-bottom: 1px solid var(--border);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--nais-space-10);
		min-width: 0;
	}

	.title {
		display: flex;
		align-items: center;
		gap: var(--nais-space-8);
		font-size: var(--sh-font-size-lg);
		font-weight: 600;
		letter-spacing: -0.015em;
		margin: 0;
		color: var(--foreground);
	}

	.title.small {
		font-size: var(--sh-font-size-body);
		line-height: 1.35;
		letter-spacing: -0.01em;
		font-weight: 600;
	}

	.count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--nais-space-24);
		line-height: var(--sh-font-line-height-compact);
		padding: 0 var(--nais-space-8);
		border-radius: 9999px;
		background: var(--secondary);
		border: 1px solid var(--border);
		color: var(--muted-foreground);
		font-size: var(--sh-font-size-xs);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--nais-space-8);
	}

	.search-slot {
		width: 300px;
		flex-shrink: 1;
		min-width: 160px;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--nais-space-12);
		flex-wrap: wrap;
	}

	.filters-slot {
		display: flex;
		gap: var(--nais-space-8);
		flex-wrap: wrap;
		align-items: center;
	}

	.menu-slot {
		margin-left: auto;
		display: flex;
		gap: var(--nais-space-8);
		flex-shrink: 0;
	}

	.content {
		display: flex;
		flex-direction: column;
		container-type: inline-size;
	}

	.collection.headerless {
		border-radius: var(--radius);
	}

	@media (max-width: 767px) {
		.header {
			padding: var(--nais-space-14) var(--nais-space-16);
			gap: var(--nais-space-12);
		}

		.header-row {
			flex-wrap: wrap;
		}

		.search-slot {
			width: 100%;
		}

		.toolbar {
			flex-direction: column;
			align-items: stretch;
			gap: var(--nais-space-8);
		}

		.filters-slot {
			overflow-x: auto;
			flex-wrap: nowrap;
		}

		.menu-slot {
			margin-left: 0;
		}
	}
</style>
