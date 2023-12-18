<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Status from '$lib/DeploymentStatus.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: team = $page.params.team;
	$: ({ TeamDeployments } = data);
	$: teamData = $TeamDeployments.data?.team;
</script>

{#if $TeamDeployments.errors}
	<Alert variant="error">
		{#each $TeamDeployments.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if teamData !== undefined}
	<Card>
		<Table size="small" zebraStripes={true}>
			<Thead>
				<Th>Resource(s)</Th>
				<Th>Created</Th>
				<Th>Environment</Th>
				<Th>Status</Th>
				<!--Th>Link</Th-->
			</Thead>
			<Tbody>
				{#each teamData.deployments.edges as edge}
					<Tr>
						{#if edge.node.id === PendingValue}
							{#each new Array(4).fill('text') as variant}
								<Td><Skeleton {variant} /></Td>
							{/each}
						{:else}
							<Td>
								{#each edge.node.resources as resource}
									<span style="color:var(--a-gray-600)">{resource.kind}:</span>
									{#if resource.kind === 'Application'}
										<a href="/team/{team}/{edge.node.env}/app/{resource.name}/deploys"
											>{resource.name}</a
										>
									{:else if resource.kind === 'Naisjob'}
										<a href="/team/{team}/{edge.node.env}/job/{resource.name}/deploys"
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
							<Td>{edge.node.env}</Td>
							{#if edge.node.statuses.length === 0}
								<Td><Status status={'unknown'} /></Td>
							{:else}
								<Td><Status status={edge.node.statuses[0].status} /></Td>
							{/if}
							<!--Td>
								{#if edge.node.repository}
									<Button
										size="xsmall"
										variant="secondary"
										href="https://github.com/{edge.node.repository}"
										as="a"
									>
										<svelte:fragment slot="icon-left"><BranchingIcon /></svelte:fragment
										>Repo</Button
									>
								{/if}
							</Td-->
						{/if}
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if teamData !== undefined}
			{#if teamData.id !== PendingValue}
				<Pagination
					pageInfo={teamData.deployments.pageInfo}
					totalCount={teamData.deployments.totalCount}
					on:nextPage={() => {
						if (!teamData?.deployments.pageInfo.hasNextPage) return;
						TeamDeployments.loadNextPage();
					}}
					on:previousPage={() => {
						if (!teamData?.deployments.pageInfo.hasPreviousPage) return;
						TeamDeployments.loadPreviousPage();
					}}
				/>
			{/if}
		{/if}
	</Card>
{/if}
