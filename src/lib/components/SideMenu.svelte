<script lang="ts" context="module">
	import type { ComponentType } from 'svelte';
	export type menuItem = {
		name: string;
		routeId: string;
		withSubRoutes?: boolean;
		icon?: ComponentType;
		iconColor?: string;
		extraRoutes?: string[];
		inventoryCount?: number;
		notNais?: boolean;
	};
	export type menuGroup = {
		items: menuItem[];
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { replacer } from '$lib/replacer';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	export let nav: menuGroup[];

	const isActive = (menuItem: menuItem, current: string | null) => {
		if (current === menuItem.routeId) {
			return true;
		}
		if (current && menuItem.withSubRoutes && current.startsWith(menuItem.routeId)) {
			return true;
		}
		if (current && menuItem.extraRoutes) {
			return menuItem.extraRoutes.includes(current);
		}

		return false;
	};
</script>

<div class="sidemenu">
	<ul>
		{#each nav as { items }, i}
			{#if i > 0}
				<hr />
			{/if}
			{#each items as item}
				<li class:active={isActive(item, $page.route.id)}>
					<a class="unstyled" href={replacer(item.routeId, $page.params)}>
						<div class="item-container">
							<div class="left-content">
								<svelte:component this={item.icon} />
								<span>
									{item.name}
									{#if item.notNais}
										<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-danger)" />
									{/if}
								</span>
							</div>
							{#if item.inventoryCount}
								<div class="right-content">
									<span class="inventorytag">{item.inventoryCount}</span>
								</div>
							{/if}
						</div>
					</a>
				</li>
			{/each}
		{/each}
	</ul>
</div>

<style>
	.inventorytag {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background-color: var(--a-surface-backdrop);
		color: var(--a-text-on-action);
		border-radius: 25%;
		font-size: var(--a-font-size-small);
	}

	.sidemenu ul {
		list-style: none;
		padding: 0;
	}

	li {
		margin: 0;
	}
	li.active a {
		color: #000;
		background-color: var(--active-color-strong);
	}
	ul {
		margin: 0;
	}
	ul a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		margin-left: -0.5rem;
		border-radius: 0.25rem;
		margin-bottom: 2px;
	}
	li.active a:hover {
		color: var(--a-text-default);
	}
	ul a:hover {
		background-color: var(--active-color-strong);
		text-decoration: underline;
	}
	.unstyled {
		text-decoration: none;
		color: inherit;
	}

	hr {
		border: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			var(--active-color-strong) 0%,
			var(--active-color-strong) 20%,
			var(--active-color) 100%
		);
	}

	.item-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.left-content {
		display: flex;
		align-items: center;
		gap: 0.5rem; /* Adds space between icon and name */
	}

	.right-content {
		margin-left: auto;
	}
</style>
