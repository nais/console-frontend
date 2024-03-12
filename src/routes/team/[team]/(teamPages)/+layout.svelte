<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import { replacer } from '$lib/replacer';
	import type { PageData } from './$houdini';
	import {
		ArrowCirclepathIcon,
		ArrowsSquarepathIcon,
		BranchingIcon,
		CogIcon,
		HouseIcon,
		LineGraphStackedIcon,
		PersonGroupIcon,
		QuietZoneIcon,
		SandboxIcon,
		VirusIcon
	} from '@nais/ds-svelte-community/icons';

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
		items: menuItem[];
	};
	$: ({ TeamRoles } = data);

	$: team = $page.params.team;
	$: currentRoute = $page.route.id;
	const nav: menuGroup[] = [
		{
			items: [
				{
					name: 'Overview',
					routeId: '/team/[team]/(teamPages)',
					withSubRoutes: false,
					icon: HouseIcon
				}
			]
		},
		{
			items: [
				{
					name: 'Apps',
					routeId: '/team/[team]/(teamPages)/applications',
					withSubRoutes: true,
					icon: SandboxIcon
				},
				{
					name: 'Jobs',
					routeId: '/team/[team]/(teamPages)/jobs',
					withSubRoutes: true,
					icon: ArrowCirclepathIcon
				},
				{
					name: 'Secrets',
					routeId: '/team/[team]/(teamPages)/secrets',
					withSubRoutes: true,
					icon: QuietZoneIcon,
					memberOnly: true
				}
				// {
				// 	name: 'Postgres',
				// 	routeId: '/team/[team]/(teamPages)/jobs',
				// 	withSubRoutes: true,
				// 	icon: PostgresStroke
				// },
				// {
				// 	name: 'Buckets',
				// 	routeId: '/team/[team]/(teamPages)/jobs',
				// 	withSubRoutes: true,
				// 	icon: BucketIcon
				// },
				// {
				// 	name: 'BigQuery',
				// 	routeId: '/team/[team]/(teamPages)/jobs',
				// 	withSubRoutes: true,
				// 	icon: Bigquery
				// },
				// {
				// 	name: 'Kafka',
				// 	routeId: '/team/[team]/(teamPages)/jobs',
				// 	withSubRoutes: true,
				// 	icon: Kafka
				// }
			]
		},
		{
			items: [
				{
					name: 'Deploys',
					routeId: '/team/[team]/(teamPages)/deploy',
					withSubRoutes: true,
					icon: ArrowsSquarepathIcon
				},
				{
					name: 'Cost',
					routeId: '/team/[team]/(teamPages)/cost',
					withSubRoutes: true,
					icon: CostIcon
				},
				{
					name: 'Utilization',
					routeId: '/team/[team]/(teamPages)/utilization',
					withSubRoutes: true,
					icon: LineGraphStackedIcon
				},
				{
					name: 'Vulnerabilities',
					routeId: '/team/[team]/(teamPages)/vulnerabilities',
					withSubRoutes: true,
					icon: VirusIcon
				}
			]
		},
		{
			items: [
				{
					name: 'Members',
					routeId: '/team/[team]/(teamPages)/members',
					withSubRoutes: true,
					icon: PersonGroupIcon
				},
				{
					name: 'Repositories',
					routeId: '/team/[team]/(teamPages)/repositories',
					withSubRoutes: true,
					icon: BranchingIcon
				},
				{
					name: 'Settings',
					routeId: '/team/[team]/(teamPages)/settings',
					withSubRoutes: true,
					memberOnly: true,
					icon: CogIcon
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
			{#each nav as { items }, i}
				{#if i > 0}
					<hr style="opacity: 50%;" />
				{/if}
				{#each items as { name, routeId, withSubRoutes, icon, memberOnly }}
					{#if !memberOnly || ($TeamRoles.data?.team !== PendingValue && ($TeamRoles.data?.team.viewerIsMember || $TeamRoles.data?.team.viewerIsOwner))}
						<li class:active={isActive(currentRoute, routeId, withSubRoutes)}>
							<a class="unstyled" href={replacer(routeId, { team })}>
								{#if icon}
									<svelte:component this={icon} />
								{/if}
								{name}</a
							>
						</li>
					{/if}
				{/each}
			{/each}
		</ul>
	</div>
	<div class="container">
		<slot />
	</div>
</div>

<style>
	.container {
		flex-grow: 1;
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
	ul {
		margin: 0;
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
	.main {
		gap: 1rem;
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		direction: row;
	}
	.unstyled {
		text-decoration: none;
		color: inherit;
	}
</style>
