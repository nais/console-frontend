<script lang="ts">
	import { fragment, graphql, type WorkloadRefs } from '$houdini';
	import Time from '$lib/Time.svelte';

	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	export let image: WorkloadRefs;

	$: workloadRefs = fragment(
		image,
		graphql(`
			fragment WorkloadRefs on ContainerImage {
				workloadReferences {
					edges {
						node {
							workload {
								__typename
								team {
									slug
								}
								environment {
									name
								}
								name
								deploymentInfo {
									url
									timestamp
								}
							}
						}
					}
				}
			}
		`)
	);
</script>

<div class="workloads">
	<h4>Workloads using image</h4>
	<Table size="small" zebraStripes>
		<Thead>
			<Th>Team</Th>
			<Th>Environment</Th>
			<Th>Workload</Th>
			<Th>Deploy ref</Th>
			<Th>Age</Th>
		</Thead>
		<Tbody>
			{#each $workloadRefs.workloadReferences.edges as workload}
				<Tr>
					<Td>
						<a href={`/team/${workload.node.workload.team.slug}`}
							>{workload.node.workload.team.slug}</a
						>
					</Td>
					<Td>
						{workload.node.workload.environment.name}
					</Td>
					<Td>
						{#if workload.node.workload.__typename === 'Application'}
							<a
								href={`/team/${workload.node.workload.team.slug}/${workload.node.workload.environment.name}/app/${workload.node.workload.name}`}
								>{workload.node.workload.name}</a
							>
						{:else if workload.node.workload.__typename === 'Job'}
							<a
								href={`/team/${workload.node.workload.team.slug}/${workload.node.workload.environment.name}/job/${workload.node.workload.name}`}
								>{workload.node.workload.name}</a
							>
						{/if}
					</Td>
					<Td>
						<a href={workload.node.workload.deploymentInfo.url} target="_blank">Run</a>
					</Td>
					<Td
						>{#if workload.node.workload.deploymentInfo.timestamp}
							<Time distance time={workload.node.workload.deploymentInfo.timestamp} />
						{/if}
					</Td>
				</Tr>
			{:else}
				<Tr>
					<Td colspan={5}>No workloads found using this image in Dependency-Track</Td>
				</Tr>
			{/each}
		</Tbody>
	</Table>
</div>

<style>
	.workloads {
		display: flex;
		flex-direction: column;
	}
</style>
