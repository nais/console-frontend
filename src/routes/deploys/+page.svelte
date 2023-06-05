<script lang="ts">
	import Card from '$lib/Card.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte';
	import { Branching } from '@nais/ds-svelte/icons';
	import type { PageData } from './$houdini';
	export let data: PageData;
	$: ({ Deploys } = data);
</script>

<Card>
	<h1>deploys</h1>
	{#if $Deploys.data}
		<Table zebraStripes={true}>
			<Thead>
				<Th>Resource(s)</Th>
				<Th>Created</Th>
				<Th>Team</Th>
				<Th>Cluster</Th>
				<Th>Status</Th>
				<Th>Links</Th>
			</Thead>
			<Tbody>
				{#each $Deploys.data.deployments.edges as edge}
					<Tr>
						<Td>
							{#each edge.node.resources as resource}
								<span style="color:var(--a-gray-600)">{resource.kind}:</span>
								{#if resource.kind === 'Application'}
									<a href="/team/{edge.node.team.name}/{edge.node.env}/{resource.name}/deploys"
										>{resource.name}</a
									>
								{:else}
									{resource.name}
								{/if}
								<br />
							{/each}
						</Td>
						<Td><Time time={edge.node.created} distance={true} /></Td>
						<Td>
							<a href="/team/{edge.node.team.name}/deploy">{edge.node.team.name}</a>
						</Td>
						<Td>{edge.node.env}</Td>

						<Td><DeploymentStatus status={edge.node.statuses[0].status} /></Td>
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
	{:else}
		<p>loading...</p>
	{/if}
</Card>
