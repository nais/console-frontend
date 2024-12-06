<script lang="ts">
	import { fragment, graphql, PendingValue, type ImageWorkloadReferences } from '$houdini';
	import Time from '$lib/Time.svelte';

	import { Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	interface Props {
		image: ImageWorkloadReferences;
	}

	let { image }: Props = $props();

	let workloadRefs = $derived(
		fragment(
			image,
			graphql(`
				fragment ImageWorkloadReferences on ContainerImage {
					workloadReferences @loading {
						nodes @loading {
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
			`)
		)
	);
</script>

<div class="workloads">
	<h4>Workloads using image</h4>
	<Table size="small" zebraStripes>
		<Thead>
			<Tr>
				<Th>Team</Th>
				<Th>Environment</Th>
				<Th>Workload</Th>
				<Th>Deploy ref</Th>
				<Th>Age</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#each $workloadRefs.workloadReferences.nodes as node}
				{#if node !== PendingValue}
					<Tr>
						<Td>
							<a href={`/team/${node.workload.team.slug}`}>{node.workload.team.slug}</a>
						</Td>
						<Td>
							{node.workload.environment.name}
						</Td>
						<Td>
							{#if node.workload.__typename === 'Application'}
								<a
									href={`/team/${node.workload.team.slug}/${node.workload.environment.name}/app/${node.workload.name}`}
									>{node.workload.name}</a
								>
							{:else if node.workload.__typename === 'Job'}
								<a
									href={`/team/${node.workload.team.slug}/${node.workload.environment.name}/job/${node.workload.name}`}
									>{node.workload.name}</a
								>
							{/if}
						</Td>
						<Td>
							<a href={node.workload.deploymentInfo.url} target="_blank">Run</a>
						</Td>
						<Td
							>{#if node.workload.deploymentInfo.timestamp}
								<Time distance time={node.workload.deploymentInfo.timestamp} />
							{/if}
						</Td>
					</Tr>
				{:else}
					<Tr>
						<Td><Skeleton variant="text" /></Td>
						<Td><Skeleton variant="text" /></Td>
						<Td><Skeleton variant="text" /></Td>
						<Td><Skeleton variant="text" /></Td>
						<Td><Skeleton variant="text" /></Td>
					</Tr>
				{/if}
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
