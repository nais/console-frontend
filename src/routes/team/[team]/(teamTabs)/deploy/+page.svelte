<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Status from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte';
	import { Branching } from '@nais/ds-svelte/icons';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ TeamDeployments } = data);
	$: team = $page.params.team;
</script>

{#if $TeamDeployments.errors}
	{#each $TeamDeployments.errors as error}
		<p>{error.message}</p>
	{/each}
{/if}
{#if $TeamDeployments.data}
	<Card>
		<Table zebraStripes={true}>
			<Thead>
				<Th>Resource(s)</Th>
				<Th>Created</Th>
				<Th>Environment</Th>
				<Th>Status</Th>
				<Th>Link</Th>
			</Thead>
			<Tbody>
				{#each $TeamDeployments.data.team.deployments.edges as edge}
					<Tr>
						<Td>
							{#each edge.node.resources as resource}
								<span style="color:var(--a-gray-600)">{resource.kind}:</span>
								{#if resource.kind === 'Application'}
									<a href="/team/{team}/{edge.node.env}/{resource.name}/deploys">{resource.name}</a>
								{:else}
									{resource.name}
								{/if}
								<br />
							{/each}
						</Td>
						<Td>
							<Time time={new Date(edge.node.created)} distance={true} />
						</Td>
						<Td>{edge.node.env}</Td>
						<Td><Status status={edge.node.statuses[0].status} /></Td>
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
					</Tr>
				{/each}
			</Tbody>
		</Table>
	</Card>
{/if}
