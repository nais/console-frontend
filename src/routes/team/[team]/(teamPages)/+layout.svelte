<script lang="ts">
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
		SandboxIcon,
		ShieldLockIcon,
		VirusIcon
	} from '@nais/ds-svelte-community/icons';

	import { PendingValue } from '$houdini';
	import type { LayoutData } from './$houdini';

	type menuGroup = {
		items: (menuItem & { memberOnly?: boolean })[];
	};

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	let { InventoryCounts, UserInfo, teamSlug } = $derived(data);

	let nav: menuGroup[] = $state([]);
	$effect(() => {
		if ($InventoryCounts) {
			nav = [
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
							name: 'Applications',
							routeId: '/team/[team]/(teamPages)/applications',
							withSubRoutes: true,
							icon: SandboxIcon,
							inventoryCount: $InventoryCounts.data?.team.inventoryCounts.applications.total,
							notNais:
								$InventoryCounts.data?.team.inventoryCounts.applications.notNais !== PendingValue
									? ($InventoryCounts.data?.team.inventoryCounts.applications.notNais ?? 0) > 0
									: false
						},
						{
							name: 'Jobs',
							routeId: '/team/[team]/(teamPages)/jobs',
							withSubRoutes: true,
							icon: ArrowCirclepathIcon,
							inventoryCount: $InventoryCounts.data?.team.inventoryCounts.jobs.total,
							notNais:
								$InventoryCounts.data?.team.inventoryCounts.jobs.notNais !== PendingValue
									? ($InventoryCounts.data?.team.inventoryCounts.jobs.notNais ?? 0) > 0
									: false
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
							icon: DatabaseIcon,
							inventoryCount: $InventoryCounts.data?.team.inventoryCounts.sqlInstances.total
						},
						{
							name: 'Buckets',
							routeId: '/team/[team]/(teamPages)/buckets',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/bucket/[bucket]'],
							withSubRoutes: true,
							icon: BucketIcon,
							inventoryCount: $InventoryCounts.data?.team.inventoryCounts.buckets.total
						},
						{
							name: 'Redis',
							routeId: '/team/[team]/(teamPages)/redis',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/redis/[redis]'],
							withSubRoutes: true,
							icon: Redis,
							inventoryCount: $InventoryCounts.data?.team.inventoryCounts.redisInstances.total,
							featureToggle: UserInfo.data?.features.redis.enabled
						},
						{
							name: 'OpenSearch',
							routeId: '/team/[team]/(teamPages)/opensearch',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/opensearch/[opensearch]'],
							withSubRoutes: true,
							icon: Opensearch,
							inventoryCount: $InventoryCounts.data?.team.inventoryCounts.openSearchInstances.total,
							featureToggle: UserInfo.data?.features.openSearch.enabled
						},
						{
							name: 'Kafka topics',
							routeId: '/team/[team]/(teamPages)/kafka',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/kafka/[kafka]'],
							withSubRoutes: true,
							icon: Kafka,
							inventoryCount: $InventoryCounts.data?.team.inventoryCounts.kafkaTopics.total,
							featureToggle: UserInfo.data?.features.kafka.enabled
						},
						{
							name: 'BigQuery',
							routeId: '/team/[team]/(teamPages)/bigquery',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/bigquery/[bigquery]'],
							withSubRoutes: true,
							icon: BigQuery,
							inventoryCount: $InventoryCounts.data?.team.inventoryCounts.bigQueryDatasets.total
						},
						{
							name: 'Unleash',
							routeId: '/team/[team]/(teamPages)/unleash',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/unleash/[unleash]'],
							withSubRoutes: true,
							icon: Unleash,
							featureToggle: UserInfo.data?.features.unleash.enabled
						}
					]
				},
				{
					items: [
						{
							name: 'Deployments',
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
						},
						{
							name: 'Activity log',
							routeId: '/team/[team]/(teamPages)/activity-log',
							withSubRoutes: true,
							memberOnly: true,
							icon: ShieldLockIcon
						}
					]
				}
			];
		} else {
			nav = [];
		}
	});

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

<svelte:head><title>{teamSlug} - Console</title></svelte:head>

<div class="main">
	<SideMenu nav={memberOnly(nav, data)} />
	<div class="container">
		{@render children?.()}
	</div>
</div>

<style>
	.container {
		flex-grow: 1;
	}

	.main {
		gap: 1rem;
		display: grid;
		grid-template-columns: 200px 1fr;
	}
</style>
