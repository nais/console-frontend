<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { menuItems } from '#lib/menuItems.js';
	import Icon from '#lib/ui/Icon.svelte';
	import { ChevronLeftIcon, ChevronRightIcon } from '#lib/icons/index.js';

	interface Props {
		features?: {
			unleash: { enabled: boolean };
			valkey: { enabled: boolean };
			kafka: { enabled: boolean };
			openSearch: { enabled: boolean };
		};
		collapsed?: boolean;
		mobileOpen?: boolean;
	}

	let { features, collapsed = $bindable(false), mobileOpen = $bindable(false) }: Props = $props();

	const currentTeamSlug = $derived(page.params.team);

	const teamGroups = $derived.by(() => {
		if (!currentTeamSlug) return [];
		const raw = menuItems({
			path: page.url.pathname,
			features
		});
		const labels = [
			'Workspace',
			'Workloads',
			'Data & Config',
			'Operations & Security',
			'Team Management'
		];
		return raw.map((group, idx) => ({
			title: labels[idx] ?? 'Resources',
			items: group
		}));
	});

	afterNavigate(() => {
		mobileOpen = false;
	});
</script>

{#if currentTeamSlug}
	{#if mobileOpen}
		<button
			type="button"
			class="sidebar-backdrop"
			aria-label="Close team navigation"
			onclick={() => (mobileOpen = false)}
		></button>
	{/if}

	<aside
		class="sh-sidebar"
		class:collapsed
		class:mobile-open={mobileOpen}
		aria-label="Team navigation"
	>
		<div class="sidebar-scroll">
			{#each teamGroups as group (group.title)}
				<div class="nav-group">
					{#if !collapsed}
						<div class="nav-group-label">{group.title}</div>
					{/if}
					<ul class="nav-list">
						{#each group.items as item (item.href)}
							<li>
								<a
									href={item.href}
									class="nav-item"
									class:active={item.active}
									aria-current={item.active ? 'page' : undefined}
									title={collapsed ? item.label : undefined}
								>
									<span class="nav-icon"><Icon icon={item.label} /></span>
									{#if !collapsed}
										<span class="nav-label">{item.label}</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<div class="sidebar-bottom desktop-only">
			<button
				type="button"
				class="collapse-btn"
				aria-label={collapsed ? 'Expand team sidebar' : 'Collapse team sidebar'}
				title={collapsed ? 'Expand team sidebar' : 'Collapse team sidebar'}
				onclick={() => (collapsed = !collapsed)}
			>
				{#if collapsed}
					<ChevronRightIcon aria-hidden="true" />
				{:else}
					<ChevronLeftIcon aria-hidden="true" />
					<span>Collapse</span>
				{/if}
			</button>
		</div>
	</aside>
{/if}

<style>
	.sh-sidebar {
		position: sticky;
		top: var(--ax-space-56);
		height: calc(100vh - var(--ax-space-56));
		width: var(--sh-sidebar-menu-width);
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background-color: var(--sidebar-background);
		color: var(--sidebar-foreground);
		border-right: var(--sh-border-width) solid var(--sidebar-border);
		z-index: 30;
		transition: width 160ms cubic-bezier(0.16, 1, 0.3, 1);
		user-select: none;
	}

	.sh-sidebar.collapsed {
		width: var(--sidebar-width-collapsed);
	}

	.sidebar-backdrop {
		display: none;
	}

	.sidebar-bottom {
		padding: var(--ax-space-8);
		border-top: var(--sh-border-width) solid var(--sidebar-border);
		display: flex;
		justify-content: flex-end;
	}

	.sh-sidebar.collapsed .sidebar-bottom {
		justify-content: center;
	}

	.collapse-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-6);
		height: var(--ax-space-28);
		padding: 0 var(--ax-space-8);
		border-radius: var(--radius-xs);
		border: var(--sh-border-width) solid transparent;
		background: transparent;
		color: var(--sidebar-muted);
		font-size: var(--sh-font-size-xs);
		font-weight: var(--sh-font-weight-medium);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background-color 120ms ease,
			color 120ms ease;
	}

	.collapse-btn:hover {
		background-color: var(--sidebar-accent);
		color: var(--foreground);
	}

	.sidebar-scroll {
		flex: 1;
		overflow-y: auto;
		padding: var(--ax-space-10) var(--ax-space-8) var(--ax-space-16) var(--ax-space-8);
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-14);
		scrollbar-width: thin;
	}

	.nav-group {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
	}

	.nav-group-label {
		padding: var(--ax-space-2) var(--ax-space-8);
		font-size: var(--sh-font-size-xs);
		font-weight: var(--sh-font-weight-medium);
		color: var(--sidebar-muted);
	}

	.nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-1);
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-6) var(--ax-space-8);
		border-radius: var(--radius-xs);
		color: var(--sidebar-foreground);
		text-decoration: none;
		font-size: var(--ax-font-size-small);
		font-weight: var(--sh-font-weight-medium);
		transition:
			background-color 110ms ease,
			color 110ms ease;
	}

	.sh-sidebar.collapsed .nav-item {
		justify-content: center;
		padding: var(--ax-space-8);
	}

	.nav-item:hover {
		background-color: var(--sidebar-accent);
		color: var(--sidebar-accent-foreground);
		text-decoration: none;
	}

	.nav-item.active {
		background-color: var(--sidebar-accent);
		color: var(--sidebar-accent-foreground);
		font-weight: var(--sh-font-weight-semibold);
	}

	.nav-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--ax-space-18);
		height: var(--ax-space-18);
		font-size: var(--sh-font-size-base);
		color: var(--sidebar-muted);
		flex-shrink: 0;
	}

	.nav-item:hover .nav-icon,
	.nav-item.active .nav-icon {
		color: currentColor;
	}

	.nav-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 960px) {
		.desktop-only {
			display: none;
		}

		.sh-sidebar {
			position: fixed;
			left: 0;
			top: var(--ax-space-56);
			bottom: 0;
			height: calc(100vh - var(--ax-space-56));
			width: var(--sh-sidebar-menu-wide-width) !important;
			transform: translateX(-100%);
			transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
			box-shadow: var(--sh-shadow-lg);
			z-index: 45;
		}

		.sh-sidebar.mobile-open {
			transform: translateX(0);
		}

		.sidebar-backdrop {
			display: block;
			position: fixed;
			inset: var(--ax-space-56) 0 0 0;
			background: rgba(5, 9, 19, 0.5);
			backdrop-filter: blur(var(--ax-space-2));
			border: none;
			z-index: 40;
		}
	}
</style>
