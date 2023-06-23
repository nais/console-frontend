<script lang="ts">
	import { PendingValue, graphql, type UserDeploys$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import DeploysIcon from '$lib/icons/DeploysIcon.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	type Deploys = Exclude<UserDeploys$result['user']['teams']['edges'], (typeof PendingValue)[]>;

	const sortTeamDeploys = (userDeploys: UserDeploys$result['user'], slice = 10) => {
		if ((userDeploys.teams.edges as (typeof PendingValue)[]).includes(PendingValue))
			return userDeploys.teams.edges as (typeof PendingValue)[];
		if ((userDeploys.teams.edges as unknown as null[]).includes(null))
			return new Array(10).fill(PendingValue);

		const edges = userDeploys.teams.edges as unknown as Deploys;

		return edges
			.map((team) => team.node.deployments)
			.flatMap((deploys) => deploys.edges.map((deploy) => deploy.node))
			.sort((a, b) => {
				return b.created.getTime() - a.created.getTime();
			})
			.slice(0, slice);
	};

	const store = graphql(`
		query UserDeploys @load {
			user @loading {
				teams @loading {
					totalCount
					edges @loading(count: 10) {
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
</script>

{#if $store.errors !== null}
	<Alert variant="error">
		{#each $store.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
{#if $store.data !== null}
	<Card height="100%">
		<h2>
			<DeploysIcon size="1.5rem" />
			My teams latest deploys
		</h2>
		<Table size="small">
			<Thead>
				<Th>Team</Th>
				<Th>App</Th>
				<Th>Env</Th>
				<Th>When</Th>
			</Thead>
			<Tbody>
				{#each sortTeamDeploys($store.data.user) as deploy}
					{#if deploy == PendingValue}
						<Tr>
							{#each new Array(4) as _}
								<Td>
									<Loading />
								</Td>
							{/each}
						</Tr>
					{:else}
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
					{/if}
				{/each}
			</Tbody>
		</Table>
	</Card>
{/if}

<style>
	h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
</style>
