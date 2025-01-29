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
					{@const { workload } = node}
					{@const deployInfo =
						workload.deployments.nodes.length > 0 ? workload.deployments.nodes[0] : null}
					<Tr>
						<Td>
							<a href={`/team/${workload.team.slug}`}>{workload.team.slug}</a>
						</Td>
						<Td>
							{workload.environment.name}
						</Td>
						<Td>
							{#if workload.__typename === 'Application'}
								<a
									href={`/team/${workload.team.slug}/${workload.environment.name}/app/${workload.name}`}
									>{workload.name}</a
								>
							{:else if workload.__typename === 'Job'}
								<a
									href={`/team/${workload.team.slug}/${workload.environment.name}/job/${workload.name}`}
									>{workload.name}</a
								>
							{/if}
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
