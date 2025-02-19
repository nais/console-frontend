<script lang="ts">
	import { fragment, graphql, type ImageWorkloadReferences } from '$houdini';
	import Time from '$lib/Time.svelte';

	import { Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import WorkloadLink from '../WorkloadLink.svelte';

	interface Props {
		image: ImageWorkloadReferences;
	}

	let { image }: Props = $props();

	let workloadRefs = $derived(
		fragment(
			image,
			graphql(`
				fragment ImageWorkloadReferences on ContainerImage {
					workloadReferences {
						nodes {
							workload {
								id
								__typename
								team {
									slug
								}
								environment {
									name
								}
								name
								deployments(first: 1) {
									nodes {
										triggerUrl
										createdAt
									}
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
	<Heading level="4" size="small" spacing>Workloads using image</Heading>
	<Table size="small" zebraStripes>
		<Thead>
			<Tr>
				<Th>Workload</Th>
				<Th>Deploy ref</Th>
				<Th>Age</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#each $workloadRefs.workloadReferences.nodes as node (node.workload.id)}
				{@const { workload } = node}
				{@const deployInfo =
					workload.deployments.nodes.length > 0 ? workload.deployments.nodes[0] : null}
				<Tr>
					<Td>
						<WorkloadLink {workload} />
					</Td>
					<Td>
						{#if deployInfo?.triggerUrl}
							<a href={deployInfo?.triggerUrl} target="_blank">Run</a>
						{/if}
					</Td>
					<Td
						>{#if deployInfo?.createdAt}
							<Time distance time={deployInfo.createdAt} />
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
