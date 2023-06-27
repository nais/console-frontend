<script lang="ts">
	import { page } from '$app/stores';
	import type { JobInstances } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { error } from '@sveltejs/kit';

	export let job: JobInstances;

	$: data = fragment(
		job,
		graphql(`
			fragment JobInstances on Job {
				name
				jobInstances @loading(count: 2) {
					id
					name
					exitCode
					reason
					startedAt
					finishedAt
					runDuration
				}
			}
		`)
	);
	$: env = $page.params.env;
	$: team = $page.params.team;
</script>

<Table>
	<Thead>
		<Th>Name</Th>
		<Th>Started</Th>
		<Th>Finished</Th>
		<Th>Duration</Th>
		<Th>ExitCode</Th>
		<Th>Reason</Th>
	</Thead>
	<Tbody>
		{#each $data.jobInstances as instance}
			<Tr>
				{#if instance === PendingValue}
					{#each new Array(6) as _}
						<Td><Loading /></Td>
					{/each}
				{:else}
					<Td>{instance.name}</Td>
					<Td><Time time={instance.startedAt} dateFormat="dd.MM.yyyy HH:mm:ss" /></Td>
					<Td><Time time={instance.finishedAt} dateFormat="dd.MM.yyyy HH:mm:ss" /></Td>
					<Td>{instance.runDuration}</Td>
					<Td>{instance.exitCode}</Td>
					<Td>{instance.reason}</Td>
				{/if}
			</Tr>
		{/each}
	</Tbody>
</Table>
