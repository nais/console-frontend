<script lang="ts">
	import type { AppInstances } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	export let app: AppInstances;
	$: data = fragment(
		app,
		graphql(`
			fragment AppInstances on App {
				instances @loading(count: 2) {
					name
					status
					restarts
					image
					created
				}
			}
		`)
	);

	$: instances = $data.instances;
</script>

<Table>
	<Thead>
		<Th>Name</Th>
		<Th>Restarts</Th>
		<Th>Image</Th>
		<Th>Status</Th>
		<Th>Created</Th>
	</Thead>
	<Tbody>
		{#each instances as instance}
			<Tr>
				{#if instance === PendingValue}
					{#each new Array(5) as _}
						<Td><Loading /></Td>
					{/each}
				{:else}
					<Td>{instance.name}</Td>
					<Td>{instance.restarts}</Td>
					<Td>{instance.image}</Td>
					<Td>{instance.status}</Td>
					{#if instance.created}
						<Td><Time time={instance.created} distance={true} /></Td>
					{:else}
						<Td>Unknown</Td>
					{/if}
				{/if}
			</Tr>
		{/each}
	</Tbody>
</Table>
