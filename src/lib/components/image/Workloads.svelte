<script lang="ts">
	import { PendingValue, type NaisJobImage$result } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	export let workloads: NaisJobImage$result['naisjob']['imageDetails']['workloadReferences'];
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
			{#each workloads as workload}
				<Tr>
					{#if workload.team.slug !== PendingValue && workload.env.name !== PendingValue && workload.name !== PendingValue}
						<Td>
							<a href={`/team/${workload.team.slug}`}>{workload.team.slug}</a>
						</Td>
						<Td>
							{workload.env.name}
						</Td>
						<Td>
							{#if workload.type === 'APP'}
								<a href={`/team/${workload.team}/${workload.env.name}/app/${workload.name}`}
									>{workload.name}</a
								>
							{:else if workload.type === 'NAISJOB'}
								<a href={`/team/${workload.team}/${workload.env.name}/job/${workload.name}`}
									>{workload.name}</a
								>
							{/if}
						</Td>
					{:else}
						<Td><Skeleton variant="text" /></Td>
						<Td><Skeleton variant="text" /></Td>
						<Td><Skeleton variant="text" /></Td>
					{/if}
					{#if workload.deployInfo.url !== PendingValue}
						<Td>
							<a href={workload.deployInfo.url} target="_blank">Run</a>
						</Td>
					{:else}
						<Td>
							<Skeleton variant="text" />
						</Td>
					{/if}
					{#if workload.deployInfo.timestamp && workload.deployInfo.timestamp !== PendingValue}
						<Td>
							<Time time={workload.deployInfo.timestamp} distance={true} />
						</Td>
					{:else}
						<Td>
							<Skeleton variant="text" />
						</Td>
					{/if}
				</Tr>
			{:else}
				<Tr>
					<Td colspan={5}>No workloads found</Td>
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
