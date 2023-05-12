<script lang="ts">
	import { fragment, graphql } from '$houdini';
	import type { AppInstances } from '$houdini';
	import Alert from '$lib/Alert.svelte';
	import Time from '$lib/Time.svelte';
	import { Body, Table, Header, HeaderCell, DataCell, Row } from '@nais/ds-svelte';

	export let app: AppInstances;
	$: data = fragment(
		app,
		graphql(`
			fragment AppInstances on App {
				instances {
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
	$: running = instances.filter((instance) => instance.status === 'Running').length;
	$: total = instances.length;
</script>

{#if instances.length > 0}
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
					<DataCell>{instance.name}</DataCell>
					<DataCell>{instance.restarts}</DataCell>
					<DataCell>{instance.image}</DataCell>
					<DataCell>{instance.status}</DataCell>
					{#if instance.created}
						<DataCell><Time time={instance.created} distance={true} /></DataCell>
					{:else}
						<DataCell>Unknown</DataCell>
					{/if}
				</Row>
			{/each}
		</Body>
	</Table>
{:else}
	<Alert variant="warning">No instances found</Alert>
{/if}
