<script lang="ts">
	import { fragment, graphql, type WorkloadDeployments } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	interface Props {
		workload: WorkloadDeployments;
	}

	let { workload }: Props = $props();

	let data = $derived(
		fragment(
			workload,
			graphql(`
				fragment WorkloadDeployments on Workload {
					__typename
					name
					team {
						slug
					}
					environment {
						name
					}
					deployments {
						nodes {
							resources {
								nodes {
									kind
									name
								}
							}
							statuses {
								nodes {
									state
									message
									createdAt
								}
							}
							createdAt
							repository
						}
					}
				}
			`)
		)
	);
	let deploysOrderedByDate = $derived(
		$data.deployments.nodes.sort((a, b) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		})
	);
</script>

{#if $data !== null}
	<Table size="small" zebraStripes>
		<Thead>
			<Tr>
				<Th>Team</Th>
				<Th>Environment</Th>
				<Th>Resource(s)</Th>
				<Th>Created</Th>
				<Th>Status</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#each deploysOrderedByDate as deploy}
				<Tr>
					<Td>{$data.team.slug}</Td>
					<Td>{$data.environment.name}</Td>
					<Td>
						{#each deploy.resources.nodes as resource}
							<span style="color:var(--a-gray-600)">{resource.kind}:</span>
							{#if resource.kind === 'Application'}
								<a
									href="/team/{$data.team.slug}/{$data.environment
										.name}/app/{resource.name}/deploys">{resource.name}</a
								>
							{:else if resource.kind === 'Job'}
								<a
									href="/team/{$data.team.slug}/{$data.environment
										.name}/job/{resource.name}/deploys">{resource.name}</a
								>
							{:else if resource.kind === 'Topic'}
								<a
									href="/team/{$data.team.slug}/{$data.environment
										.name}/kafka/{resource.name}/deploys">{resource.name}</a
								>
							{:else}
								{resource.name}
							{/if}
							<br />
						{/each}
					</Td>
					<Td><Time time={deploy.createdAt} distance={true} /></Td>
					<Td>
						{#if deploy.statuses.nodes.length === 0}
							<DeploymentStatus status={'UNKNOWN'} />
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
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}
</style>
