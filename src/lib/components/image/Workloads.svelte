<script lang="ts">
	import { Table, Tbody, Th, Thead } from '@nais/ds-svelte-community';

	//export let workloads: ;
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
			<!--{#each workloads as workload}
				<Tr>
					<Td>
						<a href={`/team/${workload.team.slug}`}>{workload.team.slug}</a>
					</Td>
					<Td>
						{workload.env.name}
					</Td>
					<Td>
						{#if workload.type === 'APP'}
							<a href={`/team/${workload.team.slug}/${workload.env.name}/app/${workload.name}`}
								>{workload.name}</a
							>
						{:else if workload.type === 'NAISJOB'}
							<a href={`/team/${workload.team.slug}/${workload.env.name}/job/${workload.name}`}
								>{workload.name}</a
							>
						{/if}
					</Td>
					<Td>
						<a href={workload.deployInfo.url} target="_blank">Run</a>
					</Td>
				</Tr>
			{:else}
				<Tr>
					<Td colspan={5}>No workloads found using this image in Dependency-Track</Td>
				</Tr>
			{/each}-->
		</Tbody>
	</Table>
</div>

<style>
	.workloads {
		display: flex;
		flex-direction: column;
	}
</style>
