<script lang="ts">
	import { fragment, graphql, PendingValue } from '$houdini';
	import type { AppInstances } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import { Body, Table, Header, HeaderCell, DataCell, Row } from '@nais/ds-svelte';

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
	<Header>
		<HeaderCell>Name</HeaderCell>
		<HeaderCell>Restarts</HeaderCell>
		<HeaderCell>Image</HeaderCell>
		<HeaderCell>Status</HeaderCell>
		<HeaderCell>Created</HeaderCell>
	</Header>
	<Body>
		{#each instances as instance}
			<Row>
				{#if instance === PendingValue}
					{#each new Array(5) as _}
						<DataCell><Loading /></DataCell>
					{/each}
				{:else}
					<DataCell>{instance.name}</DataCell>
					<DataCell>{instance.restarts}</DataCell>
					<DataCell>{instance.image}</DataCell>
					<DataCell>{instance.status}</DataCell>
					{#if instance.created}
						<DataCell><Time time={instance.created} distance={true} /></DataCell>
					{:else}
						<DataCell>Unknown</DataCell>
					{/if}
				{/if}
			</Row>
		{/each}
	</Body>
</Table>
