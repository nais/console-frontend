<script lang="ts">
	import { fragment, graphql, type WorkloadDeployments } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	export let workload: WorkloadDeployments;

	$: data = fragment(
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
				deploymentInfo {
					history {
						edges {
							node {
								resources {
									group
									kind
									name
									version
								}
								statuses {
									status
									message
									created
								}
								created
								repository
							}
						}
					}
				}
			}
		`)
	);
</script>

<h4>Deployments - {$data.environment.name}/{$data.name}</h4>
{#if $data !== null}
	<Table size="small" zebraStripes>
		<Thead>
			<Th>Team</Th>
			<Th>Environment</Th>
			<Th>Resource(s)</Th>
			<Th>Created</Th>
			<Th>Status</Th>
		</Thead>
		<Tbody>
			{#each $data.deploymentInfo.history.edges as edge}
				<Tr>
					<Td>{$data.team.slug}</Td>
					<Td>{$data.environment.name}</Td>
					<Td>
						{#each edge.node.resources as resource}
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
							{:else}
								{resource.name}
							{/if}
							<br />
						{/each}
					</Td>
					<Td><Time time={edge.node.created} distance={true} /></Td>
					<Td>
						{#if edge.node.statuses.length === 0}
							<DeploymentStatus status={'unknown'} />
						{:else}
							<DeploymentStatus status={edge.node.statuses[0].status} />
						{/if}
					</Td>
				</Tr>
			{/each}
		</Tbody>
	</Table>
{/if}
