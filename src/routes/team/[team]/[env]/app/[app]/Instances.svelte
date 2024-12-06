<script lang="ts">
	import { page } from '$app/stores';
	import type { AppInstances } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';

	interface Props {
		app: AppInstances;
	}

	let { app }: Props = $props();
	let data = $derived(
		fragment(
			app,
			graphql(`
				fragment AppInstances on Application {
					instances {
						edges {
							node {
								name
								restarts
								status {
									state
									message
								}
								created
							}
						}
					}
					resources {
						requests {
							cpu
							memory
						}
					}
				}
			`)
		)
	);

	let appName = $derived($page.params.app);
	let env = $derived($page.params.env);
	let team = $derived($page.params.team);
</script>

{#if $data.instances}
	{@const instances = $data.instances.edges.map((edge) => edge.node)}
	{@const resources = $data.resources}

	<Table size="small" style="margin-bottom: 1rem" zebraStripes>
		<Thead>
			<Tr>
				<Th>Name</Th>
				<Th>CPU request</Th>
				<Th>Memory request</Th>
				<Th>Restarts</Th>
				<Th>Status</Th>
				<Th>Created</Th>
				<Th>Message</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#each instances as instance}
				<Tr>
					<Td>
						<a href="/team/{team}/{env}/app/{appName}/logs?name={instance.name}">{instance.name}</a>
					</Td>
					<Td>{resources.requests.cpu ? resources.requests.cpu + ' CPUs' : '-'}</Td>
					<Td>{resources.requests.memory ? prettyBytes(resources.requests.memory) : '-'}</Td>
					<Td>{instance.restarts}</Td>
					<Td>{instance.status.state}</Td>
					{#if instance.created}
						<Td><Time time={instance.created} distance={true} /></Td>
					{:else}
						<Td>Unknown</Td>
					{/if}
					{#if instance.status.message}
						<Td>{instance.status.message}</Td>
					{:else}
						<Td />
					{/if}
				</Tr>
			{:else}
				<Tr>
					<Td colspan={7}>No instances found</Td>
				</Tr>
			{/each}

			<Tr>
				<Td><b>Total:</b></Td>
				<Td
					>{(resources.requests.cpu * instances.length).toLocaleString('en-GB', {
						maximumFractionDigits: 3
					})} CPUs</Td
				>
				<Td>{prettyBytes(resources.requests.memory * instances.length)}</Td>
				<Td></Td>
				<Td></Td>
				<Td></Td>
				<Td></Td>
			</Tr>
		</Tbody>
	</Table>
{/if}
