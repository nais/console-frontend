<script lang="ts">
	import type { JobInstances } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@nais/ds-svelte-community';

	export let job: JobInstances;

	$: data = fragment(
		job,
		graphql(`
			fragment JobInstances on Job {
				name
				instances @loading(count: 2) {
					name
					startTime
					completionTime
					failed
					succeeded
					runDuration
					statusType
					statusMessage
					statusReason
				}
			}
		`)
	);
</script>

<Table>
	<Thead>
		<Th>Status</Th>
		<Th>Name</Th>
		<Th>Started</Th>
		<Th>Duration</Th>
		<Th>Comment</Th>
	</Thead>
	<Tbody>
		{#each $data.instances as instance}
			<Tr>
				{#if instance === PendingValue}
					{#each new Array(6) as _}
						<Td><Loading /></Td>
					{/each}
				{:else}
					<Td>
						{#if instance.statusType === 'Complete'}
							<SuccessIcon size="1.5rem" style="color: var(--a-icon-success)" />
						{:else}
							<WarningIcon size="1.5rem" style="color: var(--a-icon-warning)" />
						{/if}
					</Td>
					<Td>{instance.name}</Td>
					<Td><Time time={instance.startTime} dateFormat="dd.MM.yyyy HH:mm:ss" /></Td>
					<Td>{instance.runDuration}</Td>
					{#if instance.statusType === 'Failed' && instance.statusMessage}
						<Td>
							{instance.statusType}: <Tooltip
								content={instance.statusMessage + ' - ' + instance.failed + ' pod(s) failed.'}
								>{instance.statusReason}</Tooltip
							>
						</Td>
					{:else}
						<Td>
							<Tooltip
								content={instance.succeeded +
									' pod(s) succeeded. ' +
									instance.failed +
									' pod(s) failed.'}
								>{instance.statusType}
							</Tooltip>
						</Td>
					{/if}
				{/if}
			</Tr>
		{:else}
			<Tr>
				<Td colspan={5}>No job instances found 🤪</Td>
			</Tr>
		{/each}
	</Tbody>
</Table>
