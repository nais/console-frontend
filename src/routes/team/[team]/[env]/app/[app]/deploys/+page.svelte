<script lang="ts">
	import Card from '$lib/Card.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import {
		Alert,
		Button,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import { BranchingIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ AppDeploys } = data);
</script>

{#if $AppDeploys.errors}
	<Alert variant="error">
		{#each $AppDeploys.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if $AppDeploys.data}
	<Card>
		<Table size="small" zebraStripes>
			<Thead>
				<Th>Resource(s)</Th>
				<Th>Created</Th>
				<Th>Status</Th>
				<Th>Link</Th>
			</Thead>
			<Tbody>
				{#each $AppDeploys.data.team.environment.application.deploymentInfo.history.edges as edge}
					<Tr>
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
							<Tooltip content={edge.node.statuses[0]?.message || ''}
								><DeploymentStatus status={edge.node.statuses[0]?.status} /></Tooltip
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
									<svelte:fragment slot="icon-left"><BranchingIcon /></svelte:fragment>Repo</Button
								>
							{/if}
						</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	</Card>
{/if}
