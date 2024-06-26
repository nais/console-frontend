<script lang="ts">
	import { page } from '$app/stores';
	import type { menuItem } from '$lib/components/SideMenu.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import BigQuery from '$lib/icons/BigQuery.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Opensearch from '$lib/icons/Opensearch.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import Unleash from '$lib/icons/Unleash.svelte';
	import {
		ArrowCirclepathIcon,
		ArrowsSquarepathIcon,
		BranchingIcon,
		BucketIcon,
		CogIcon,
		DatabaseIcon,
		HouseIcon,
		LineGraphStackedIcon,
		PersonGroupIcon,
		QuietZoneIcon,
		SandboxIcon
	} from '@nais/ds-svelte-community/icons';

	import type { LayoutData } from './$types';

	type menuGroup = {
		items: (menuItem & { memberOnly?: boolean })[];
	};

	export let data: LayoutData;

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
			]
		},
		{
			items: [
				{
					name: 'Postgres',
					routeId: '/team/[team]/(teamPages)/postgres',
					extraRoutes: ['/team/[team]/(teamPages)/[env]/postgres/[postgres]'],
					withSubRoutes: true,
					icon: DatabaseIcon
				},
				{
					name: 'Buckets',
					routeId: '/team/[team]/(teamPages)/buckets',
					extraRoutes: ['/team/[team]/(teamPages)/[env]/bucket/[bucket]'],
					withSubRoutes: true,
					icon: BucketIcon
				},
				{
					name: 'Redis',
					routeId: '/team/[team]/(teamPages)/redis',
					extraRoutes: ['/team/[team]/(teamPages)/[env]/redis/[redis]'],
					withSubRoutes: true,
					icon: Redis
				},
				{
					name: 'OpenSearch',
					routeId: '/team/[team]/(teamPages)/opensearch',
					extraRoutes: ['/team/[team]/(teamPages)/[env]/opensearch/[opensearch]'],
					withSubRoutes: true,
					icon: Opensearch
				},
				{
					name: 'Kafka topics',
					routeId: '/team/[team]/(teamPages)/kafka',
					extraRoutes: ['/team/[team]/(teamPages)/[env]/kafka/[kafka]'],
					withSubRoutes: true,
					icon: Kafka
				},
				{
					name: 'BigQuery',
					routeId: '/team/[team]/(teamPages)/bigquery',
					extraRoutes: ['/team/[team]/(teamPages)/[env]/bigquery/[bigquery]'],
					withSubRoutes: true,
					icon: BigQuery
				},
				{
					name: 'Unleash',
					routeId: '/team/[team]/(teamPages)/unleash',
					extraRoutes: ['/team/[team]/(teamPages)/[env]/unleash/[unleash]'],
					withSubRoutes: true,
					icon: Unleash
				}
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

	function memberOnly(
		nav: menuGroup[],
		data: { viewerIsMember: boolean; viewerIsOwner: boolean } | null
	) {
		return nav.map((group) => {
			return {
				items: group.items.filter((item) => {
					return !item.memberOnly || data?.viewerIsOwner || data?.viewerIsMember;
				})
			};
		});
	}
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

<div class="main">
	<SideMenu nav={memberOnly(nav, data)} />
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
		flex-direction: row;
	}
</style>
