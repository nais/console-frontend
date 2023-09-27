<script lang="ts">
	import { page } from '$app/stores';
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
					state
					message
					restarts
					created
					image
				}
			}
		`)
	);

	$: instances = $data.instances;
	$: appName = $page.params.app;
	$: env = $page.params.env;
	$: team = $page.params.team;
</script>

<Table style="margin-bottom: 1rem">
	<Thead>
		<Th>Name</Th>
		<Th>Restarts</Th>
		<Th>Status</Th>
		<Th>Created</Th>
		<Th>Message</Th>
	</Thead>
	<Tbody>
		{#each instances as instance}
			<Tr>
				{#if instance === PendingValue}
					{#each new Array(5).fill('medium') as size}
						<Td><Loading {size} /></Td>
					{/each}
				{:else}
					<Td
						><a href="/team/{team}/{env}/app/{appName}/logs?name={instance.name}">{instance.name}</a
						></Td
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
	</Tbody>
</Table>
