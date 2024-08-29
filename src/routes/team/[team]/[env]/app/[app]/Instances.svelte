<script lang="ts">
	import { page } from '$app/stores';
	import type { AppInstances } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { cpuUtilization, sumCPURequests, sumMemoryRequests } from '$lib/utils/resources';
	import { Skeleton, Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@nais/ds-svelte-community';

	export let app: AppInstances;
	$: data = fragment(
		app,
		graphql(`
			fragment AppInstances on App {
				instances @loading {
					name
					state
					message
					restarts
					created
					image
				}
				resources @loading {
					requests {
						cpu
						memory
					}
				}
				utilization @loading {
					cpuUsage: usage(resourceType: CPU)
					memoryUsage: usage(resourceType: MEMORY)
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

<Table size="small" style="margin-bottom: 1rem" zebraStripes>
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
					{#each new Array(7).fill('text') as variant}
						<Td><Skeleton {variant} /></Td>
					{/each}
				{:else}
					<Td>
						<a href="/team/{team}/{env}/app/{appName}/logs?name={instance.name}">{instance.name}</a>
					</Td>
					<Td
						>{resources && resources !== PendingValue && resources.requests.cpu
							? resources.requests.cpu
							: '-'}</Td
					>
					<Td
						>{resources && resources !== PendingValue && resources.requests.memory !== ''
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
			{#if resources === PendingValue}
				{#each new Array(7).fill('text') as variant}
					<Td><Skeleton {variant} /></Td>
				{/each}
			{:else}
				<Td><b>Total:</b></Td>
				<Td
					>{sumCPURequests(instances.length, resources.requests.cpu)} CPUs
					<!-- <Tooltip content="Current CPU utilization" -->
					<!-- 	>{#if utilization !== undefined && utilization !== PendingValue} -->
					<!-- 		{#if utilization.cpu.timestamp.getTime() > new Date(+new Date() - 2 * 60 * 60 * 1000).getTime()} -->
					<!-- 			({utilization.cpu.utilization.toLocaleString('en-GB', { -->
					<!-- 				minimumFractionDigits: 2, -->
					<!-- 				maximumFractionDigits: 2 -->
					<!-- 			})}%) -->
					<!-- 		{/if} -->
					<!-- 	{/if}</Tooltip -->
					<!-- > -->
				</Td>
				<Td
					>{sumMemoryRequests(instances.length, resources.requests.memory)}

					<!-- <Tooltip content="Current memory utilization" -->
					<!-- 	>{#if utilization !== undefined && utilization !== PendingValue} -->
					<!-- 		{#if utilization.memory.timestamp.getTime() > new Date(+new Date() - 2 * 60 * 60 * 1000).getTime()} -->
					<!-- 			({utilization.memory.utilization.toLocaleString('en-GB', { -->
					<!-- 				minimumFractionDigits: 2, -->
					<!-- 				maximumFractionDigits: 2 -->
					<!-- 			})}%) -->
					<!-- 		{/if} -->
					<!-- 	{/if}</Tooltip -->
					<!-- > -->
				</Td>
				<Td></Td>
				<Td></Td>
				<Td></Td>
				<Td></Td>
			{/if}
		</Tr>
	</Tbody>
</Table>
