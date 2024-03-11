<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import { replacer } from '$lib/replacer';
	import type { PageData } from './$houdini';
	import { HearingLoopIcon } from '@nais/ds-svelte-community/icons';

	export let data: PageData;
	type menuItem = {
		name: string;
		routeId: string;
		withSubRoutes: boolean;
		icon?: ConstructorOfATypedSvelteComponent;
		iconColor?: string;
		memberOnly?: boolean;
	};
	type menuGroup = {
		name: string;
		items: menuItem[];
	};
	$: ({ TeamRoles } = data);

	$: team = $page.params.team;
	$: currentRoute = $page.route.id;
	const nav: menuGroup[] = [
		{
			name: '',
			items: [
				{
					name: 'Overview',
					routeId: '/team/[team]/(teamTabs)',
					withSubRoutes: false,
					icon: HearingLoopIcon
				}
			]
		},
		{
			name: 'Inventory',
			items: [
				{
					name: 'Apps',
					routeId: '/team/[team]/(teamTabs)/applications',
					withSubRoutes: true,
					icon: HearingLoopIcon
				},
				{
					name: 'Jobs',
					routeId: '/team/[team]/(teamTabs)/jobs',
					withSubRoutes: true,
					icon: HearingLoopIcon
				},
				{
					name: 'Postgres',
					routeId: '/team/[team]/(teamTabs)/jobs',
					withSubRoutes: true,
					icon: HearingLoopIcon
				},
				{
					name: 'Buckets',
					routeId: '/team/[team]/(teamTabs)/jobs',
					withSubRoutes: true,
					icon: HearingLoopIcon
				},
				{
					name: 'BigQuery',
					routeId: '/team/[team]/(teamTabs)/jobs',
					withSubRoutes: true,
					icon: HearingLoopIcon
				},
				{
					name: 'Secret',
					routeId: '/team/[team]/(teamTabs)/jobs',
					withSubRoutes: true,
					icon: HearingLoopIcon,
					memberOnly: true
				},
				{
					name: 'Kafka',
					routeId: '/team/[team]/(teamTabs)/jobs',
					withSubRoutes: true,
					icon: HearingLoopIcon
				}
			]
		},
		{
			name: 'Insight',
			items: [
				{
					name: 'Deploys',
					routeId: '/team/[team]/(teamTabs)/deploy',
					withSubRoutes: true
				},
				{
					name: 'Cost',
					routeId: '/team/[team]/(teamTabs)/cost',
					withSubRoutes: true
				},
				{
					name: 'Utilization',
					routeId: '/team/[team]/(teamTabs)/utilization',
					withSubRoutes: true
				},
				{
					name: 'Vulnerabilities',
					routeId: '/team/[team]/(teamTabs)/vulnerabilities',
					withSubRoutes: true
				}
			]
		},
		{
			name: 'Team',
			items: [
				{
					name: 'Members',
					routeId: '/team/[team]/(teamTabs)/members',
					withSubRoutes: true
				},
				{
					name: 'Repositories',
					routeId: '/team/[team]/(teamTabs)/repositories',
					withSubRoutes: true
				}
			]
		}
	];

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

<svelte:head><title>{team} - Console</title></svelte:head>

<div class="header">
	<h2>{team}</h2>
</div>
<div class="main">
	<div class="sidemenu">
		<ul>
			{#each nav as { name, items }}
				{#if name}
					<hr />
				{/if}
				{#each items as { name, routeId, withSubRoutes, icon, iconColor }}
					<li class:active={isActive(currentRoute, routeId, withSubRoutes)}>
						<a class="unstyled" href={replacer(routeId, { team })}>
							{#if icon}
								<svelte:component this={icon} />
							{/if}

							{name}</a
						>
					</li>
				{/each}
			{/each}
			{#if $TeamRoles.data}
				{#if $TeamRoles.data.team !== PendingValue && ($TeamRoles.data.team.viewerIsMember || $TeamRoles.data.team.viewerIsOwner)}
					<li class:active={isActive(currentRoute, '/team/[team]/(teamTabs)/secrets', true)}>
						<a class="unstyled" href={replacer('/team/[team]/(teamTabs)/secrets', { team })}
							>Secrets</a
						>
					</li>
					<li class:active={isActive(currentRoute, '/team/[team]/(teamTabs)/settings', true)}>
						<a class="unstyled" href={replacer('/team/[team]/(teamTabs)/settings', { team })}
							>Settings</a
						>
					</li>
				{/if}
			{/if}
		</ul>
	</div>
	<div class="container">
		<slot />
	</div>
</div>

<style>
	.container {
		margin: auto;
		min-width: 1000px;
		max-width: 1432px;
	}

	.header {
		display: flex;
		justify-content: space-between;
	}
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
		background-color: var(--a-surface-alt-1-subtle);
		border-radius: 0.25rem;
	}
	ul a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		margin-left: -0.5rem;
	}
	li.active a:hover {
		color: var(--a-text-default);
	}
	ul a:hover {
		background-color: var(--a-surface-alt-1-moderate);
	}

	b {
		display: block;
		color: grey;
		margin-top: 0.4rem;
	}

	.main {
		display: flex;
		direction: row;
	}
	.unstyled {
		text-decoration: none;
		color: inherit;
	}
</style>
