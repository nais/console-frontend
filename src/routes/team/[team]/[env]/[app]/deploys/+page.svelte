<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import { Button, Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@nais/ds-svelte';
	import { Branching } from '@nais/ds-svelte/icons';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ AppDeploys } = data);
	$: team = $page.params.team;
	$: env = $page.params.env;
	$: app = $page.params.app;
</script>

{#if $AppDeploys.errors}
	<h3>No deploys found</h3>
	{#each $AppDeploys.errors as error}
		<p>{error.message}</p>
	{/each}
{/if}

{#if $AppDeploys.data}
	<Card>
		<Table zebraStripes={true}>
			<Thead>
				<Th>Resource(s)</Th>
				<Th>Created</Th>
				<Th>Status</Th>
				<Th>Link</Th>
			</Thead>
			<Tbody>
				{#each $AppDeploys.data.app.deploys.edges as edge}
					<Tr>
						{#if edge.node.id === PendingValue}
							{#each new Array(4) as _}
								<Td>
									<Loading />
								</Td>
							{/each}
						{:else}
							<Td>
								{#each edge.node.resources as resource}
									<span style="color:var(--a-gray-600)">{resource.kind}:</span>
									{resource.name}
									<br />
								{/each}
							</Td>
							<Td>
								<Time time={new Date(edge.node.created)} distance={true} />
							</Td>
							<Td>
								<Tooltip content={edge.node.statuses[0].message || ''}
									><DeploymentStatus status={edge.node.statuses[0].status} /></Tooltip
								>
							</Td>
							<Td>
								{#if edge.node.repository}
									<Button
										size="xsmall"
										variant="secondary"
										href="https://github.com/{edge.node.repository}"
										as="a"
									>
										<svelte:fragment slot="icon-left"><Branching /></svelte:fragment>Repo</Button
									>
								{/if}
							</Td>
						{/if}
					</Tr>
				{/each}
			</Tbody>
		</Table>
	</Card>
{/if}
