<script lang="ts">
	import { page } from '$app/stores';
	import type { AppInstances } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import { sumCPURequests, sumMemoryRequests } from '$lib/utils/resources';
	import { Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@nais/ds-svelte-community';

	export let cpuUtilization: number | undefined | typeof PendingValue;
	export let memoryUtilization: number | undefined | typeof PendingValue;

	export let app: AppInstances;
	$: data = fragment(
		app,
		graphql(`
			fragment AppInstances on App {
				instances @loading(count: 2) {
					name
					state
					message
					restarts
					created
					image
				}
				resources @loading {
					requests @loading {
						cpu
						memory
					}
				}
			}
		`)
	);

	$: instances = $data.instances;
	$: resources = $data.resources;
	$: appName = $page.params.app;
	$: env = $page.params.env;
	$: team = $page.params.team;
</script>

<Table size="small" style="margin-bottom: 1rem">
	<Thead>
		<Th>Name</Th>
		<Th>CPU request</Th>
		<Th>Memory request</Th>
		<Th>Restarts</Th>
		<Th>Status</Th>
		<Th>Created</Th>
		<Th>Message</Th>
	</Thead>
	<Tbody>
		{#each instances as instance}
			<Tr>
				{#if instance === PendingValue}
					{#each new Array(7).fill('medium') as size}
						<Td><Loading {size} /></Td>
					{/each}
				{:else}
					<Td
						><a href="/team/{team}/{env}/app/{appName}/logs?name={instance.name}">{instance.name}</a
						></Td
					>
					<Td
						>{resources && resources.requests !== PendingValue && resources.requests.cpu
							? resources.requests.cpu
							: '-'}</Td
					>
					<Td
						>{resources && resources.requests !== PendingValue && resources.requests.memory !== ''
							? resources.requests.memory
							: '-'}</Td
					>
					<Td>{instance.restarts}</Td>
					<Td>{instance.state}</Td>
					{#if instance.created}
						<Td><Time time={instance.created} distance={true} /></Td>
					{:else}
						<Td>Unknown</Td>
					{/if}
					{#if instance.message}
						<Td>{instance.message}</Td>
					{:else}
						<Td />
					{/if}
				{/if}
			</Tr>
		{/each}

		{#if instances.length > 0 && cpuUtilization !== undefined && cpuUtilization !== PendingValue && memoryUtilization !== undefined && memoryUtilization !== PendingValue}
			<Tr>
				<Td><b>Total:</b></Td>
				<Td
					>{resources && resources.requests !== PendingValue
						? sumCPURequests(instances.length, resources.requests.cpu)
						: '-'}
					<Tooltip content="Current CPU utilization"
						>({cpuUtilization > 100
							? '>100'
							: cpuUtilization.toLocaleString('en-GB', {
									maximumFractionDigits: 2
							  })}%)</Tooltip
					></Td
				>
				<Td
					>{resources && resources.requests !== PendingValue
						? sumMemoryRequests(instances.length, resources.requests.memory)
						: '-'}
					<Tooltip content="Current memory utilization"
						>({memoryUtilization.toLocaleString('en-GB', {
							maximumFractionDigits: 2
						})}%)</Tooltip
					></Td
				>
				<Td></Td>
				<Td></Td>
				<Td></Td>
				<Td></Td>
			</Tr>
		{/if}
	</Tbody>
</Table>
