<script lang="ts">
	import { graphql, paginatedFragment, type UserDeploys } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import DeploysIcon from '$lib/icons/DeploysIcon.svelte';
	import { Table, Tr, Td, Th, Thead, Tbody } from '@nais/ds-svelte';
	export let user: UserDeploys;
	$: teams = paginatedFragment(
		user,
		graphql(`
			fragment UserDeploys on User {
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
		`)
	);
	$: teamDeploys = $teams.data?.teams.edges
		.map((team) => team.node.deployments)
		.flatMap((deploys) => deploys.edges.map((deploy) => deploy.node))
		.sort((a, b) => b.created.getTime() - a.created.getTime())
		.slice(0, 10);
	$: totalDeploys = $teams.data?.teams.edges
		.map((edge) => edge.node.deployments.totalCount)
		.reduce((a, b) => a + b, 0);
</script>

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
						<Time time={deploy.created} distance={true} />
					</Td>
				</Tr>
			{:else}
				<p>no deploys</p>
			{/each}
		</Tbody>
	</Table>
	<div class="tot">
		<a href="/deploys">{totalDeploys} deploys total</a>
	</div>
</Card>

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
