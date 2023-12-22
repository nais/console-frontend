<script lang="ts">
	import { PendingValue, graphql, type UserDeploys$result } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import DeploysIcon from '$lib/icons/DeploysIcon.svelte';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	type Deploys = Exclude<UserDeploys$result['user']['teams']['edges'], (typeof PendingValue)[]>;

	const sortTeamDeploys = (userDeploys: UserDeploys$result['user'], slice = 20) => {
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
					edges @loading(count: 20) {
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
	<h2>
		<DeploysIcon size="1.5rem" />
		My teams latest deploys
	</h2>
	<Table size="small">
		<Thead>
			<Th>Resource(s)</Th>
			<Th>Created</Th>
			<Th>Team</Th>
			<Th>Cluster</Th>
			<Th>Status</Th>
			<!--Th>Links</Th-->
		</Thead>
		<Tbody>
			{#each sortTeamDeploys($store.data.user) as deploy}
				{#if deploy == PendingValue}
					<Tr>
						{#each new Array(5).fill('text') as variant}
							<Td>
								<Skeleton {variant} />
							</Td>
						{/each}
					</Tr>
				{:else}
					<Tr>
						<Td>
							{#each deploy.resources as resource}
								<span style="color:var(--a-gray-600)">{resource.kind}:</span>
								{#if resource.kind === 'Application'}
									<a href="/team/{deploy.team.name}/{deploy.env}/app/{resource.name}/deploys"
										>{resource.name}</a
									>
								{:else if resource.kind === 'Naisjob'}
									<a href="/team/{deploy.team.name}/{deploy.env}/job/{resource.name}/deploys"
										>{resource.name}</a
									>
								{:else}
									{resource.name}
								{/if}
								<br />
							{/each}
						</Td>

						<Td>
							<Time time={deploy.created} distance={true} />
						</Td>
						<Td>
							<a href="/team/{deploy.team.name}">{deploy.team.name}</a>
						</Td>
						<Td>
							{deploy.env}
						</Td>
						<Td
							>{#if deploy.statuses.length === 0}<DeploymentStatus
									status={'unknown'}
								/>{:else}<DeploymentStatus status={deploy.statuses[0].status} />{/if}</Td
						>
					</Tr>
				{/if}
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
