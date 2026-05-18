<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		title,
		count,
		children,
		menu,
		search,
		filters,
		actions
	}: {
		title?: string;
		count?: number;
		children: Snippet;
		menu?: Snippet;
		search?: Snippet;
		filters?: Snippet;
		actions?: Snippet;
	} = $props();
</script>

<div class="list">
	<header class="header">
		<div class="header-row">
			<div class="header-left">
				{#if title}
					<h2 class="title">{title}</h2>
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
	<div class="items">
		{@render children()}
	</div>
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		min-width: 0;
		border-radius: var(--ax-radius-12);
	}

	.header {
		display: flex;
		flex-direction: column;
		padding: var(--ax-space-16) var(--ax-space-24);
		gap: var(--ax-space-16);
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--ax-space-16);
		flex-wrap: wrap;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		flex-shrink: 0;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		color: var(--ax-text-neutral);
	}

	.count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.5rem;
		height: 1.5rem;
		padding: 0 var(--ax-space-6);
		border-radius: var(--ax-radius-4);
		background: var(--ax-neutral-200);
		color: var(--ax-text-neutral);
		font-size: var(--ax-font-size-small);
		font-weight: 500;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.search-slot {
		width: 320px;
		flex-shrink: 1;
		min-width: 160px;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--ax-space-12);
		flex-wrap: wrap;
	}

	.filters-slot {
		display: flex;
		gap: var(--ax-space-8);
		flex-wrap: wrap;
		align-items: center;
	}

	.menu-slot {
		margin-left: auto;
	}

	.menu-slot {
		display: flex;
		gap: var(--ax-space-8);
		flex-shrink: 0;
	}

	.items {
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 767px) {
		.header {
			padding: var(--ax-space-12) var(--ax-space-16);
			gap: var(--ax-space-12);
		}

		.header-row {
			flex-direction: column;
			align-items: stretch;
			gap: var(--ax-space-12);
		}

		.search-slot {
			width: 100%;
		}

		.toolbar {
			flex-direction: column;
			align-items: stretch;
			gap: var(--ax-space-8);
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
