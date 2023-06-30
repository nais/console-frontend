<script lang="ts">
	import type { JobInstances } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@nais/ds-svelte-community';
	import { ArrowsCirclepath } from '@nais/ds-svelte-community/icons';

	export let job: JobInstances;

	$: data = fragment(
		job,
		graphql(`
			fragment JobInstances on NaisJob {
				name
				runs @loading(count: 2) {
					name
					startTime
					completionTime
					failed
					duration
					message
				}
			}
		`)
	);
</script>

<Table>
	<Thead>
		<Th style="width: 4rem;">Status</Th>
		<Th>Name</Th>
		<Th>Started</Th>
		<Th>Duration</Th>
		<Th>Comment</Th>
	</Thead>
	<Tbody>
		{#each $data.runs as run}
			<Tr>
				{#if run === PendingValue}
					{#each new Array(6) as _}
						<Td><Loading /></Td>
					{/each}
				{:else}
					<Td style="text-align: center;">
						{#if run.failed === false && !run.completionTime}
							<Tooltip content="Run in progress" placement="right">
								<ArrowsCirclepath
									width="1.5rem"
									height="1.5rem"
									style="color: var(--a-icon-success)"
								/>
							</Tooltip>
						{:else if run.failed === false && run.completionTime}
							<Tooltip content="Run completed successfully" placement="right"
								><SuccessIcon size="1.5rem" style="color: var(--a-icon-success)" />
							</Tooltip>
						{:else}
							<Tooltip content="Run failed" placement="right">
								<WarningIcon size="1.5rem" style="color: var(--a-icon-danger)" />
							</Tooltip>
						{/if}
					</Td>
					<Td>{run.name}</Td>
					<Td>
						{#if run.startTime}
							<Time time={run.startTime} dateFormat="dd.MM.yyyy HH:mm:ss" distance={true} />
						{:else}
							Not started
						{/if}
					</Td>
					<Td>{run.duration}</Td>
					{#if run.message}
						<Td>
							{run.message}
						</Td>
					{/if}
				{/if}
			</Tr>
		{:else}
			<Tr>
				<Td colspan={5}>No job instances found</Td>
			</Tr>
		{/each}
	</Tbody>
</Table>
