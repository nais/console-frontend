<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Loading from '$lib/Loading.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { BranchingIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	export let data: PageData;
	$: ({ Deploys } = data);
	$: deploys = $Deploys.data?.deployments;
</script>

<svelte:head><title>Deploys - Console</title></svelte:head>

<Card>
	<h2>Deploys</h2>
	{#if $Deploys.errors}
		<Alert variant="error">
			{#each $Deploys.errors as error}
				{error.message}
			{/each}
		</Alert>
	{/if}

	{#if deploys}
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
				{#each deploys.edges as edge}
					{#if edge.node.id === PendingValue}
						<Tr>
							{#each new Array(6).fill('medium') as size}
								<Td><Loading {size} /></Td>
							{/each}
						</Tr>
					{:else}
						<Tr>
							<Td>
								{#each edge.node.resources as resource}
									<span style="color:var(--a-gray-600)">{resource.kind}:</span>
									{#if resource.kind === 'Application'}
										<a
											href="/team/{edge.node.team.name}/{edge.node.env}/app/{resource.name}/deploys"
											>{resource.name}</a
										>
									{:else if resource.kind === 'Naisjob'}
										<a
											href="/team/{edge.node.team.name}/{edge.node.env}/job/{resource.name}/deploys"
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

							{#if edge.node.statuses.length === 0}
								<Td><DeploymentStatus status={'unknown'} /></Td>
							{:else}
								<Td><DeploymentStatus status={edge.node.statuses[0].status} /></Td>
							{/if}
							<Td>
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
							</Td>
						</Tr>
					{/if}
				{/each}
			</Tbody>
		</Table>
		<Pagination
			totalCount={deploys.totalCount}
			pageInfo={deploys.pageInfo}
			on:nextPage={() => {
				if (!deploys?.pageInfo.hasNextPage) return;
				Deploys.loadNextPage();
			}}
			on:previousPage={() => {
				if (!deploys?.pageInfo.hasPreviousPage) return;
				Deploys.loadPreviousPage();
			}}
		/>
	{/if}
</Card>
