<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import DeploysIcon from '$lib/icons/DeploysIcon.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte';
	const store = graphql(`
		query UserDeploys @loading(cascade: true, count: 3) @load {
			user {
				email
				teams @paginate(mode: SinglePage) {
					totalCount
					edges {
						node {
							deployments {
								totalCount
								edges {
									node {
										created
										env
										team {
											name
										}
										resources {
											kind
											name
										}
										statuses {
											status
										}
									}
								}
							}
						}
					}
				}
			}
		}
	`);
	// TODO: vi flytter denne logikken til egne funksjoner som vi kaller etter at vi har sjekket pending value i templatinga
	$: teamDeploys = $store.data?.user.teams.edges
		.map((team) => team.node.deployments)
		.filter((deps) => deps.totalCount !== PendingValue)
		.flatMap((deploys) => deploys.edges.map((deploy) => deploy.node))
		.sort((a, b) => {
			if (a.created !== PendingValue && b.created !== PendingValue) {
				return a.created.getTime() - b.created.getTime();
			}
			return 0;
		})

		.slice(0, 10);
	// $: totalDeploys = $store.data?.user.teams.edges
	// 	.map((edge) => edge.node.deployments.totalCount)
	// 	.reduce((a, b) => {
	// 		if (a !== PendingValue && b !== PendingValue) {
	// 			return a + b;
	// 		}
	// 		return 0;
	// 	}, 0);
</script>

{#if $store.data}
	<Card height="100%">
		<h3>
			<DeploysIcon size="1.5rem" />
			My latest deploys
		</h3>
		<Table size="small">
			<Thead>
				<Th>Team</Th>
				<Th>App</Th>
				<Th>Env</Th>
				<Th>When</Th>
			</Thead>
			<Tbody>
				{#if $store.data.user.email === PendingValue}
					{#each new Array(10) as _}
						<Tr>
							{#each new Array(4) as _}
								<Td><Loading /></Td>
							{/each}
						</Tr>
					{/each}
				{:else}
					{#each teamDeploys || [] as deploy}
						<Tr>
							<Td>
								<a href="/team/{deploy.team.name}">{deploy.team.name}</a>
							</Td>
							<Td>
								<a href="/team/{deploy.team.name}/{deploy.env}/{deploy.resources[0].name}">
									{deploy.resources[0].name}</a
								>
							</Td>
							<Td>
								{deploy.env}
							</Td>
							<Td>
								<Time
									time={(deploy.created !== PendingValue && deploy.created) || new Date()}
									distance={true}
								/>
							</Td>
						</Tr>
					{:else}
						<p>no deploys</p>
					{/each}
				{/if}
			</Tbody>
		</Table>
		<div class="tot">
			<!-- <a href="/deploys">{totalDeploys} deploys total</a> -->
		</div>
	</Card>
{/if}

<style>
	h3 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.tot {
		text-align: right;
		margin-top: 1rem;
	}
</style>
