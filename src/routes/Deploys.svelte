<script lang="ts">
	import { graphql, PendingValue, type UserDeploys$result } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import DeploysIcon from '$lib/icons/DeploysIcon.svelte';
	import Time from '$lib/Time.svelte';
	import { Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	const store = graphql(`
		query UserDeploys @load {
			me @loading {
				__typename
				... on User {
					teams {
						nodes {
							team {
								slug
								deployments(first: 10) {
									nodes {
										id
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

		let retval = userDeploys.teams.nodes
			.flatMap((team) => team.team.deployments.nodes)
			.map((deploy) => ({ ...deploy })) // Create a new object for each deployment
			.sort((a, b) => {
				return new Date(b.created).getTime() - new Date(a.created).getTime();
			})
			.slice(0, 10);

		return retval;
	};
</script>

<GraphErrors errors={$store.errors} />

{#if $store.data !== null}
	<h2>
		<DeploysIcon size="1.5rem" />
		My teams latest deployments
	</h2>
	<Table size="small" zebraStripes>
		<Thead>
			<Tr>
				<Th>Resource(s)</Th>
				<Th>Team</Th>
				<Th>Environment</Th>
				<Th>Created</Th>
				<Th>Status</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#each sortTeamDeploys($store.data.me) as deploy}
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
							{#each deploy.resources as resource, i}
								<span style="color:var(--a-gray-600)">{resource.kind}:</span>
								{#if resource.kind === 'Naisjob'}
									<a
										href="/team/{deploy.team.slug}/{deploy.environment.name}/job/{deploy
											.resources[0].name}"
									>
										{deploy.resources[0].name}</a
									>
								{:else if resource.kind === 'Application'}
									<a
										href="/team/{deploy.team.slug}/{deploy.environment.name}/app/{deploy
											.resources[0].name}"
									>
										{resource.name}</a
									>
								{:else}
									{resource.name}
								{/if}
								{#if deploy.resources.length > 1 && i !== deploy.resources.length - 1}
									<br />
								{/if}
							{/each}
						</Td>
						<Td>
							<a href="/team/{deploy.team.slug}">{deploy.team.slug}</a>
						</Td>
						<Td>
							{deploy.environment.name}
						</Td>

						<Td>
							<Time time={deploy.created} distance={true} />
						</Td>
						<Td>
							{#if deploy.statuses.length === 0}
								<DeploymentStatus status={'unknown'} />
							{:else}
								<DeploymentStatus status={deploy.statuses[0].status} />
							{/if}
						</Td>
					</Tr>
				{/if}
			{:else}
				<Tr>
					<Td colspan={999}>No deployments found</Td>
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
