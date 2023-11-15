<script lang="ts">
	import { page } from '$app/stores';
	import type { AppInstances } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import bytes from 'bytes-iec';

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

	function sumCPURequests(numOfInstances: number, cpuRequest: string) {
		if (cpuRequest.includes('m')) {
			const cpuRequestInMilliCPU = parseInt(cpuRequest.replace('m', ''));
			const cpuRequestInCPU = cpuRequestInMilliCPU / 1000;
			const totalCPURequest = cpuRequestInCPU * numOfInstances;
			return totalCPURequest.toLocaleString('en-GB', {
				maximumFractionDigits: 3
			});
		} else {
			const totalCPURequest = parseInt(cpuRequest) * numOfInstances;
			return totalCPURequest.toLocaleString('en-GB', {
				maximumFractionDigits: 3
			});
		}
	}

	function sumMemoryRequests(numOfInstances: number, memoryRequest: string) {
		let request = bytes.parse(memoryRequest.concat('B'));
		if (request) {
			if (memoryRequest.includes('i')) {
				return bytes(request * numOfInstances, { mode: 'binary' })?.replace('B', '');
			}
			return bytes(request * numOfInstances)?.replace('B', '');
		}
		return '-';
	}

	$: instances = $data['instances'];
	$: resources = $data['resources'];
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
		<Tr>
			<Td><b>Total:</b></Td>
			<Td
				>{resources && resources.requests !== PendingValue
					? sumCPURequests(instances.length, resources.requests.cpu)
					: '-'}</Td
			>
			<Td
				>{resources && resources.requests !== PendingValue
					? sumMemoryRequests(instances.length, resources.requests.memory)
					: '-'}</Td
			>
			<Td></Td>
			<Td></Td>
			<Td></Td>
			<Td></Td>
		</Tr>
	</Tbody>
</Table>
