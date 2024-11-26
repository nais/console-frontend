<script lang="ts">
	import { page } from '$app/stores';
	import type { JobInstances } from '$houdini';
	import { fragment, graphql, JobRunState } from '$houdini';
	import Time from '$lib/Time.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@nais/ds-svelte-community';
	import { ArrowsCirclepathIcon, QuestionmarkIcon } from '@nais/ds-svelte-community/icons';

	export let job: JobInstances;

	$: data = fragment(
		job,
		graphql(`
			fragment JobInstances on Job {
				name
				runs(first: 20) {
					edges {
						node {
							name
							startTime
							completionTime
							duration
							status {
								message
								state
							}
						}
					}
				}
			}
		`)
	);

	$: jobName = $page.params.job;
	$: env = $page.params.env;
	$: team = $page.params.team;

	const formatDuration = (duration: number) => {
		const minute = 60;
		const hour = 60 * minute;

		const hours = Math.floor(duration / hour);
		const minutes = Math.floor((duration % hour) / minute);
		const seconds = Math.floor(duration % minute);

		if (hours > 0) {
			return `${hours}h ${minutes}m ${seconds}s`;
		} else if (minutes > 0) {
			return `${minutes}m ${seconds}s`;
		} else {
			return `${seconds}s`;
		}
	};
</script>

<Table size="small" zebraStripes>
	<Thead>
		<Th style="width: 4rem;">Status</Th>
		<Th>Name</Th>
		<Th>Started</Th>
		<Th>Duration</Th>
		<Th>Message</Th>
	</Thead>
	<Tbody>
		{#each $data.runs.edges as run}
			<Tr>
				<Td style="text-align: center;">
					{#if run.node.status.state === JobRunState.RUNNING}
						<Tooltip content="Run in progress" placement="right">
							<ArrowsCirclepathIcon
								width="1.5rem"
								height="1.5rem"
								style="color: var(--a-icon-success)"
							/>
						</Tooltip>
					{:else if run.node.status.state === JobRunState.PENDING}
						<Tooltip content="Run is pending" placement="right">
							<ArrowsCirclepathIcon width="1.5rem" height="1.5rem" style="color: inherit" />
						</Tooltip>
					{:else if run.node.status.state === JobRunState.SUCCEEDED}
						<Tooltip content="Run completed successfully" placement="right"
							><Nais size="1.5rem" style="color: var(--a-icon-success)" />
						</Tooltip>
					{:else if run.node.status.state === JobRunState.UNKNOWN}
						<Tooltip content="Run status unknown" placement="right">
							<span style="font-size: 1.5rem;">
								<QuestionmarkIcon style="color: var(--a-icon-warning)" />
							</span>
						</Tooltip>
					{:else}
						<Tooltip content="Run failed" placement="right">
							<WarningIcon size="1.5rem" style="color: var(--a-icon-danger)" />
						</Tooltip>
					{/if}
				</Td>
				<Td
					><a href="/team/{team}/{env}/job/{jobName}/logs?name={run.node.name}">{run.node.name}</a
					></Td
				>
				<Td>
					{#if run.node.startTime}
						<Time time={run.node.startTime} dateFormat="dd.MM.yyyy HH:mm:ss" distance={true} />
					{:else}
						Not started
					{/if}
				</Td>
				<Td>{formatDuration(run.node.duration)}</Td>
				{#if run.node.status.message}
					<Td>{run.node.status.message}</Td>
				{:else}
					<Td />
				{/if}
			</Tr>
		{:else}
			<Tr>
				<Td colspan={5}>No job instances found</Td>
			</Tr>
		{/each}
	</Tbody>
</Table>
