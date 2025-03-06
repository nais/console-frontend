<script lang="ts">
	import { graphql, type UserDeploys$result } from '$houdini';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';

	const store = graphql(`
		query UserDeploys @load {
			me {
				__typename
				... on User {
					teams {
						nodes {
							team {
								slug
								deployments(first: 10) {
									nodes {
										id
										createdAt
										environmentName
										teamSlug
										resources {
											nodes {
												id
												kind
												name
											}
										}
										statuses {
											nodes {
												state
											}
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
		if (userDeploys.__typename !== 'User') return [];

		let retval = userDeploys.teams.nodes
			.flatMap((team) => team.team.deployments.nodes)
			.map((deploy) => ({ ...deploy })) // Create a new object for each deployment
			.sort((a, b) => {
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			})
			.slice(0, 10);

		return retval;
	};
</script>

<GraphErrors errors={$store.errors} />

{#if $store.data !== null}
	<h2>
		<RocketIcon size="1.5rem" />
		My teams latest deployments
	</h2>
	<Table size="small">
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
			{#each sortTeamDeploys($store.data.me) as deploy (deploy.id)}
				<Tr>
					<Td>
						{#each deploy.resources.nodes as resource (resource.id)}
							{#if resource.kind === 'Application'}
								<WorkloadLink
									workload={{
										__typename: 'App',
										environment: { name: deploy.environmentName },
										team: { slug: deploy.teamSlug },
										name: resource.name
									}}
								/>
							{:else if resource.kind === 'Job' || resource.kind === 'Naisjob'}
								<WorkloadLink
									workload={{
										__typename: 'Job',
										environment: { name: deploy.environmentName },
										team: { slug: deploy.teamSlug },
										name: resource.name
									}}
								/>
							{:else}
								<span style="color:var(--a-gray-600)">{resource.kind}:</span>
								{resource.name}
							{/if}
							<br />
						{/each}
					</Td>
					<Td>
						<a href="/team/{deploy.teamSlug}">{deploy.teamSlug}</a>
					</Td>
					<Td>
						{deploy.environmentName}
					</Td>

					<Td>
						<Time time={deploy.createdAt} distance={true} />
					</Td>
					<Td>
						{#if deploy.statuses.nodes.length === 0}
							<DeploymentStatus status="UNKNOWN" />
						{:else}
							<DeploymentStatus status={deploy.statuses.nodes[0].state} />
						{/if}
					</Td>
				</Tr>
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
