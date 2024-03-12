<script lang="ts" context="module">
	export type menuItem = {
		name: string;
		routeId: string;
		withSubRoutes: boolean;
		icon?: ConstructorOfATypedSvelteComponent;
		iconColor?: string;
	};
	export type menuGroup = {
		items: menuItem[];
	};
</script>

<script lang="ts">
	import { replacer } from '$lib/replacer';
	import { page } from '$app/stores';
	export let nav: menuGroup[];

	const isActive = (current: string | null, routeID: string, allWithPrefix = false) => {
		if (current === routeID) {
			return true;
		}
		if (current && allWithPrefix) {
			return current.startsWith(routeID);
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
			{#each items as { name, routeId, withSubRoutes, icon }}
				<li class:active={isActive($page.route.id, routeId, withSubRoutes)}>
					<a class="unstyled" href={replacer(routeId, $page.params)}>
						{#if icon}
							<svelte:component this={icon} />
						{/if}
						{name}</a
					>
				</li>
			{/each}
		{/each}
	</ul>
</div>

<style>
	.sidemenu {
		width: 200px;
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
</style>
