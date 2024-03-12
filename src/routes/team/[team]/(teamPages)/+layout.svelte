<script lang="ts">
	import { page } from '$app/stores';
	import CostIcon from '$lib/icons/CostIcon.svelte';
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
	import type { PageData } from './$houdini';
	import type { menuItem } from '$lib/components/SideMenu.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import { PendingValue, type TeamRoles$result } from '$houdini';

	type menuGroup = {
		items: (menuItem & { memberOnly?: boolean })[];
	};

	export let data: PageData;
	$: ({ TeamRoles } = data);

	$: team = $page.params.team;
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
					extraRoutes: ['/team/[team]/(teamPages)/[env]/secret/[secret]'],
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

	function memberOnly(nav: menuGroup[], data: TeamRoles$result | null) {
		return nav.map((group) => {
			return {
				items: group.items.filter((item) => {
					return (
						!item.memberOnly ||
						(data?.team !== PendingValue && (data?.team.viewerIsOwner || data?.team.viewerIsMember))
					);
				})
			};
		});
	}
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

<div class="main">
	<SideMenu nav={memberOnly(nav, $TeamRoles.data)} />
	<div class="container">
		<slot />
	</div>
</div>

<style>
	.container {
		flex-grow: 1;
	}

	.main {
		gap: 1rem;
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		direction: row;
	}
</style>
