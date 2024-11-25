<script lang="ts">
	import { page } from '$app/stores';
	import { graphql, PendingValue } from '$houdini';
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
	import type { InventoryCountsVariables } from './$houdini';
	import type { LayoutData } from './$types';

	type menuGroup = {
		items: (menuItem & { memberOnly?: boolean })[];
	};

	export let data: LayoutData;

	export const _InventoryCountsVariables: InventoryCountsVariables = () => {
		return { team: $page.params.team };
	};

	const inventoryCounts = graphql(`
		query InventoryCounts($team: Slug!) @load {
			team(slug: $team) @loading(cascade: true) {
				inventoryCounts {
					applications {
						total
						notNais
					}
					jobs {
						total
						notNais
					}
					sqlInstances {
						total
					}
					buckets {
						total
					}
					redisInstances {
						total
					}
					openSearchInstances {
						total
					}
					kafkaTopics {
						total
					}
					bigQueryDatasets {
						total
					}
				}
			}
		}
	`);

	let nav: menuGroup[];
	$: {
		if ($inventoryCounts) {
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
							inventoryCount: $inventoryCounts.data?.team.inventoryCounts.applications.total,
							notNais:
								$inventoryCounts.data?.team.inventoryCounts.applications.notNais !== PendingValue
									? ($inventoryCounts.data?.team.inventoryCounts.applications.notNais ?? 0) > 0
									: false
						},
						{
							name: 'Jobs',
							routeId: '/team/[team]/(teamPages)/jobs',
							withSubRoutes: true,
							icon: ArrowCirclepathIcon,
							inventoryCount: $inventoryCounts.data?.team.inventoryCounts.jobs.total,
							notNais:
								$inventoryCounts.data?.team.inventoryCounts.jobs.notNais !== PendingValue
									? ($inventoryCounts.data?.team.inventoryCounts.jobs.notNais ?? 0) > 0
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
							inventoryCount: $inventoryCounts.data?.team.inventoryCounts.sqlInstances.total
						},
						{
							name: 'Buckets',
							routeId: '/team/[team]/(teamPages)/buckets',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/bucket/[bucket]'],
							withSubRoutes: true,
							icon: BucketIcon,
							inventoryCount: $inventoryCounts.data?.team.inventoryCounts.buckets.total
						},
						{
							name: 'Redis',
							routeId: '/team/[team]/(teamPages)/redis',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/redis/[redis]'],
							withSubRoutes: true,
							icon: Redis,
							inventoryCount: $inventoryCounts.data?.team.inventoryCounts.redisInstances.total
						},
						{
							name: 'OpenSearch',
							routeId: '/team/[team]/(teamPages)/opensearch',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/opensearch/[opensearch]'],
							withSubRoutes: true,
							icon: Opensearch,
							inventoryCount: $inventoryCounts.data?.team.inventoryCounts.openSearchInstances.total
						},
						{
							name: 'Kafka topics',
							routeId: '/team/[team]/(teamPages)/kafka',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/kafka/[kafka]'],
							withSubRoutes: true,
							icon: Kafka,
							inventoryCount: $inventoryCounts.data?.team.inventoryCounts.kafkaTopics.total
						},
						{
							name: 'BigQuery',
							routeId: '/team/[team]/(teamPages)/bigquery',
							extraRoutes: ['/team/[team]/(teamPages)/[env]/bigquery/[bigquery]'],
							withSubRoutes: true,
							icon: BigQuery,
							inventoryCount: $inventoryCounts.data?.team.inventoryCounts.bigQueryDatasets.total
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
	}

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

<SideMenu nav={memberOnly(nav, data)} />
