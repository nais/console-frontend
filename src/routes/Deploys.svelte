<script lang="ts">
	import { graphql, PendingValue, type UserDeploys$result } from '$houdini';
	import DeploysIcon from '$lib/icons/DeploysIcon.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	const store = graphql(`
		query UserDeploys @load {
			me @loading {
				__typename
				... on User {
					teams {
						pageInfo {
							totalCount
						}
						nodes {
							team {
								slug
								deployments(first: 10) {
									nodes {
										created
										environment {
											name
										}
										team {
											slug
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

	const sortTeamDeploys = (userDeploys: UserDeploys$result['me']) => {
		if (userDeploys === PendingValue)
			return Array(20).fill(PendingValue) as (typeof PendingValue)[];
		if (userDeploys.__typename !== 'User') return [];

		return userDeploys.teams.nodes
			.map((team) => team.team.deployments)
			.flatMap((deploys) => deploys.nodes)
			.sort((a, b) => {
				return b.created.getTime() - a.created.getTime();
			})
			.slice(0, 10);
	};
</script>

{#if $store.errors !== null}
	<Alert variant="error">
		{#each $store.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
{#if $store.data !== null}
	<h2>
		<DeploysIcon size="1.5rem" />
		My teams latest deploys
	</h2>
	<Table size="small" zebraStripes>
		<Thead>
			<Th>Team</Th>
			<Th>App</Th>
			<Th>Env</Th>
			<Th>When</Th>
		</Thead>
		<Tbody>
			{#each sortTeamDeploys($store.data.me) as deploy}
				{#if deploy == PendingValue}
					<Tr>
						{#each new Array(4).fill('text') as variant}
							<Td>
								<Skeleton {variant} />
							</Td>
						{/each}
					</Tr>
				{:else}
					<Tr>
						<Td>
							<a href="/team/{deploy.team.slug}">{deploy.team.slug}</a>
						</Td>
						<Td>
							{#if deploy.resources[0].kind === 'Naisjob'}
								<a
									href="/team/{deploy.team.slug}/{deploy.environment.name}/job/{deploy.resources[0]
										.name}"
								>
									{deploy.resources[0].name}</a
								>
							{:else}
								<a
									href="/team/{deploy.team.slug}/{deploy.environment.name}/app/{deploy.resources[0]
										.name}"
								>
									{deploy.resources[0].name}</a
								>
							{/if}
						</Td>
						<Td>
							{deploy.environment.name}
						</Td>
						<Td>
							<Time time={deploy.created} distance={true} />
						</Td>
					</Tr>
				{/if}
			{:else}
				<Tr>
					<Td colspan={999}>No deploys found</Td>
				</Tr>
			{/each}
		</Tbody>
	</Table>
{/if}

<style>
	h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
</style>
