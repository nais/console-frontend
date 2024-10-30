<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Status from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: team = $page.params.team;
	$: ({ TeamDeployments } = data);
</script>

{#if $TeamDeployments.errors}
	<Alert variant="error">
		{#each $TeamDeployments.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if $TeamDeployments.data}
	{@const d = $TeamDeployments.data.team.deployments}
	<Card>
		<Table size="small" zebraStripes>
			<Thead>
				<Th>Resource(s)</Th>
				<Th>Created</Th>
				<Th>Environment</Th>
				<Th>Status</Th>
			</Thead>
			<Tbody>
				{#each d.edges as edge}
					<Tr>
						<Td>
							{#each edge.node.resources as resource}
								<span style="color:var(--a-gray-600)">{resource.kind}:</span>
								{#if resource.kind === 'Application'}
									<a href="/team/{team}/{edge.node.environment.name}/app/{resource.name}"
										>{resource.name}</a
									>
								{:else if resource.kind === 'Naisjob'}
									<a href="/team/{team}/{edge.node.environment.name}/job/{resource.name}"
										>{resource.name}</a
									>
								{:else}
									{resource.name}
								{/if}
								<br />
							{/each}
						</Td>
						<Td>
							<Time time={new Date(edge.node.created)} distance={true} />
						</Td>
						<Td>{edge.node.environment.name}</Td>
						{#if edge.node.statuses.length === 0}
							<Td><Status status={'unknown'} /></Td>
						{:else}
							<Td><Status status={edge.node.statuses[0].status} /></Td>
						{/if}
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if d.pageInfo.hasPreviousPage || d.pageInfo.hasNextPage}
			<div class="pagination">
				<span>
					{#if d.pageInfo.pageStart !== d.pageInfo.pageEnd}
						{d.pageInfo.pageStart} - {d.pageInfo.pageEnd}
					{:else}
						{d.pageInfo.pageStart}
					{/if}

					of {d.pageInfo.totalCount}
				</span>

				<span style="padding-left: 1rem;">
					<Button
						size="small"
						variant="secondary"
						disabled={!d.pageInfo.hasPreviousPage}
						on:click={async () => {
							return await TeamDeployments.loadPreviousPage();
						}}><ChevronLeftIcon /></Button
					>
					<Button
						size="small"
						variant="secondary"
						disabled={!d.pageInfo.hasNextPage}
						on:click={async () => {
							return await TeamDeployments.loadNextPage();
						}}
					>
						<ChevronRightIcon /></Button
					>
				</span>
			</div>
		{/if}
	</Card>
{/if}
