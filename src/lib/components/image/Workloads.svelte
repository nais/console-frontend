<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	export let workloads: {
		readonly id: string;
		readonly name: string;
		readonly team: string;
		readonly workloadType: string;
		readonly environment: string;
		readonly deployInfo: {
			readonly deployer: string;
			readonly timestamp: Date | null;
			readonly commitSha: string;
			readonly url: string;
		};
	}[];
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
					<Td>
						<a href={`/team/${workload.team}`}>{workload.team}</a>
					</Td>
					<Td>
						{workload.environment}
					</Td>
					<Td>
						{#if workload.workloadType === 'app'}
							<a href={`/team/${workload.team}/${workload.environment}/app/${workload.name}`}
								>{workload.name}</a
							>
						{:else if workload.workloadType === 'job'}
							<a href={`/team/${workload.team}/${workload.environment}/job/${workload.name}`}
								>{workload.name}</a
							>
						{/if}
					</Td>
					<Td>
						{#if workload.deployInfo.url}
							<a href={workload.deployInfo.url} target="_blank">Run</a>
						{/if}
					</Td>
					<Td>
						{#if workload.deployInfo.timestamp !== null}
							<Time time={workload.deployInfo.timestamp} distance={true} />
						{/if}
					</Td>
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
