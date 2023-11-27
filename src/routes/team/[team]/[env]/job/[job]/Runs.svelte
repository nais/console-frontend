<script lang="ts">
	import { page } from '$app/stores';
	import type { JobInstances } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import Time from '$lib/Time.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Skeleton, Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@nais/ds-svelte-community';
	import { ArrowsCirclepathIcon } from '@nais/ds-svelte-community/icons';

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

	$: jobName = $page.params.job;
	$: env = $page.params.env;
	$: team = $page.params.team;
</script>

<Table size="small">
	<Thead>
		<Th style="width: 4rem;">Status</Th>
		<Th>Name</Th>
		<Th>Started</Th>
		<Th>Duration</Th>
		<Th>Message</Th>
	</Thead>
	<Tbody>
		{#each $data.runs as run}
			<Tr>
				{#if run === PendingValue}
					{#each new Array(6).fill('text') as variant}
						<Td><Skeleton {variant} /></Td>
					{/each}
				{:else}
					<Td style="text-align: center;">
						{#if run.failed === false && !run.completionTime}
							<Tooltip content="Run in progress" placement="right">
								<ArrowsCirclepathIcon
									width="1.5rem"
									height="1.5rem"
									style="color: var(--a-icon-success)"
								/>
							</Tooltip>
						{:else if run.failed === false && run.completionTime}
							<Tooltip content="Run completed successfully" placement="right"
								><Nais size="1.5rem" style="color: var(--a-icon-success)" />
							</Tooltip>
						{:else}
							<Tooltip content="Run failed" placement="right">
								<WarningIcon size="1.5rem" style="color: var(--a-icon-danger)" />
							</Tooltip>
						{/if}
					</Td>
					<Td><a href="/team/{team}/{env}/job/{jobName}/logs?name={run.name}">{run.name}</a></Td>
					<Td>
						{#if run.startTime}
							<Time time={run.startTime} dateFormat="dd.MM.yyyy HH:mm:ss" distance={true} />
						{:else}
							Not started
						{/if}
					</Td>
					<Td>{run.duration}</Td>
					{#if run.message}
						<Td>{run.message}</Td>
					{:else}
						<Td />
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
