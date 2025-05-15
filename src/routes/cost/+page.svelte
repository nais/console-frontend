<script lang="ts">
	import type { TenantCost$result } from '$houdini';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { round } from '$lib/utils/resources';
	import { Table, Tbody, Td, Th, Thead, Tr, type TableSortState } from '@nais/ds-svelte-community';
	import { SvelteSet } from 'svelte/reactivity';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let tenantCost = $derived(data.TenantCost);
	let services = new SvelteSet<string>();
	type TeamData = {
		slug: string;
		services: {
			[service: string]: {
				cost: number;
			};
		};
		sum: number;
	};

	let sortState: TableSortState = $state({
		orderBy: 'SUM',
		direction: 'descending'
	});

	// Extract services from the tenant cost data
	$tenantCost.data?.teams.nodes.forEach((team: TenantCost$result['teams']['nodes'][0]) => {
		team.cost.daily.series.forEach((day) => {
			day.services.forEach((service) => {
				services.add(service.service);
			});
		});
	});
	type SortBy = 'SUM' | 'TEAM' | string;

	const sortTable = (key: SortBy, sortState: TableSortState) => {
		if (!sortState) {
			sortState = {
				orderBy: key,
				direction: 'descending'
			};
		} else if (sortState.orderBy === key) {
			if (sortState.direction === 'ascending') {
				sortState.direction = 'descending';
			} else {
				sortState.direction = 'ascending';
			}
		} else {
			sortState.orderBy = key;
			if (key === 'SUM') {
				sortState.direction = 'ascending';
			} else {
				sortState.direction = 'descending';
			}
		}

		return sortState;
	};
	$inspect(sortState, 'sortState');

	// Extract team data and calculate the sum of costs
	let teamData = $derived(
		($tenantCost.data?.teams.nodes
			.map((team: TenantCost$result['teams']['nodes'][0]) => {
				return {
					slug: team.slug,
					sum: team.cost.daily.series.reduce((acc, day) => {
						acc += day.sum;
						return acc;
					}, 0),
					services: team.cost.daily.series.reduce(
						(acc, day) => {
							day.services.forEach((service) => {
								if (!acc[service.service]) {
									acc[service.service] = { cost: 0 };
								}
								acc[service.service].cost += service.cost;
							});
							return acc;
						},
						{} as { [service: string]: { cost: number } }
					)
				};
			})
			.sort((a, b) => {
				if (sortState.orderBy === 'SUM') {
					return sortState.direction === 'ascending' ? a.sum - b.sum : b.sum - a.sum;
				} else if (sortState.orderBy === 'TEAM') {
					return sortState.direction === 'ascending'
						? a.slug.localeCompare(b.slug)
						: b.slug.localeCompare(a.slug);
				} else {
					if (a.services[sortState.orderBy.toLowerCase()] === undefined) {
						a.services[sortState.orderBy.toLowerCase()] = { cost: 0 };
					}
					if (b.services[sortState.orderBy.toLowerCase()] === undefined) {
						b.services[sortState.orderBy.toLowerCase()] = { cost: 0 };
					}
					return sortState.direction === 'ascending'
						? a.services[sortState.orderBy.toLowerCase()].cost -
								b.services[sortState.orderBy.toLowerCase()].cost
						: b.services[sortState.orderBy.toLowerCase()].cost -
								a.services[sortState.orderBy.toLowerCase()].cost;
				}
			}) as TeamData[]) || []
	);
</script>

<div class="container">
	<GraphErrors errors={$tenantCost.errors} />
	{#if $tenantCost.data}
		<Table
			size="small"
			sort={sortState}
			onsortchange={(key) => {
				sortState = sortTable(key as SortBy, sortState);
			}}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey="TEAM">Team</Th>
					{#each Array.from(services).toSorted() as service (service)}
						<Th sortable={true} sortKey={service.toUpperCase()}>{service}</Th>
					{/each}
					<Th sortable={true} sortKey="SUM">Sum</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each teamData as team (team)}
					<Tr>
						<Td>{team.slug}</Td>
						{#each Array.from(services).toSorted() as service (service)}
							<Td
								>{team.services[service]?.cost
									? euroValueFormatter(round(team.services[service]?.cost))
									: '-'}</Td
							>
						{/each}
						<Td>{euroValueFormatter(round(team.sum))}</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		<!-- <pre>{JSON.stringify($tenantCost.data?.teams, null, 2)}</pre> -->
	{/if}
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
</style>
