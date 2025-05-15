<script lang="ts">
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';
	import { SvelteSet } from 'svelte/reactivity';
	import type { TenantCost$result } from '$houdini';

	let { data }: PageProps = $props();
	let tenantCost = $derived(data.TenantCost);
	let services = new SvelteSet<string>();
	type TeamData = {
		name: string;
		services: {
			[service: string]: {
				cost: number;
			};
		};
		sum: number;
	};
	let teamData = [] as TeamData[];

	// Extract services from the tenant cost data
	$tenantCost.data?.teams.nodes.forEach((team: TenantCost$result['teams']['nodes'][0]) => {
		team.cost.daily.series.forEach((day) => {
			day.services.forEach((service) => {
				services.add(service.service);
			});
		});
	});

	$tenantCost.data?.teams.nodes.forEach((team: TenantCost$result['teams']['nodes'][0]) => {
		teamData.push({
			name: team.slug,
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
		});
	});
</script>

<div class="container">
	<GraphErrors errors={$tenantCost.errors} />
	{#if $tenantCost.data}
		<Table>
			<Thead>
				<Tr>
					<Th>Team</Th>
					{#each Array.from(services).toSorted() as service (service)}
						<Th>{service}</Th>
					{/each}
				</Tr>
			</Thead>
			<Tbody>
				{#each teamData as team (team)}
					<Tr>
						<Td>{team.name}</Td>
						{#each Array.from(services).toSorted() as service (service)}
							<Td>{team.services[service]?.cost ?? 0}</Td>
						{/each}
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
