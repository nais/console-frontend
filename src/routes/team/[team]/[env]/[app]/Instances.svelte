<script lang="ts">
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import { fragment, graphql } from '$houdini';
	import type { AppInstances } from '$houdini';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Table from '$lib/Table.svelte';
	import Time from '$lib/Time.svelte';

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

{#if instances}
	<Table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Restarts</th>
				<th>Image</th>
				<th>Status</th>
				<th>Created</th>
			</tr>
		</thead>
		<tbody>
			{#each instances as instance}
				<tr>
					<td>{instance.name}</td>
					<td>{instance.restarts}</td>
					<td>{instance.image} </td><td>{instance.status}</td>
					{#if instance.created}
						<td><Time time={instance.created} distance={true} /></td>
					{:else}
						<td>Unknown</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</Table>
{/if}
