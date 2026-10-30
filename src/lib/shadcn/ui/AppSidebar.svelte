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
		top: 3.5rem;
		height: calc(100vh - 3.5rem);
		width: 14.5rem;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background-color: var(--sidebar-background);
		color: var(--sidebar-foreground);
		border-right: 1px solid var(--sidebar-border);
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
		padding: 0.5rem;
		border-top: 1px solid var(--sidebar-border);
		display: flex;
		justify-content: flex-end;
	}

	.sh-sidebar.collapsed .sidebar-bottom {
		justify-content: center;
	}

	.collapse-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		height: 1.75rem;
		padding: 0 0.5rem;
		border-radius: calc(var(--radius) - 3px);
		border: 1px solid transparent;
		background: transparent;
		color: var(--sidebar-muted);
		font-size: 0.75rem;
		font-weight: 500;
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
		padding: 0.625rem 0.5rem 1rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		scrollbar-width: thin;
	}

	.nav-group {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.nav-group-label {
		padding: 0.125rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--sidebar-muted);
	}

	.nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.0625rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.375rem 0.5rem;
		border-radius: calc(var(--radius) - 3px);
		color: var(--sidebar-foreground);
		text-decoration: none;
		font-size: 0.8125rem;
		font-weight: 500;
		transition:
			background-color 110ms ease,
			color 110ms ease;
	}

	.sh-sidebar.collapsed .nav-item {
		justify-content: center;
		padding: 0.5rem;
	}

	.nav-item:hover {
		background-color: var(--sidebar-accent);
		color: var(--sidebar-accent-foreground);
		text-decoration: none;
	}

	.nav-item.active {
		background-color: var(--sidebar-accent);
		color: var(--sidebar-accent-foreground);
		font-weight: 600;
	}

	.nav-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.15rem;
		height: 1.15rem;
		font-size: 1rem;
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
			top: 3.5rem;
			bottom: 0;
			height: calc(100vh - 3.5rem);
			width: 15.5rem !important;
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
			inset: 3.5rem 0 0 0;
			background: rgba(5, 9, 19, 0.5);
			backdrop-filter: blur(2px);
			border: none;
			z-index: 40;
		}
	}
</style>
