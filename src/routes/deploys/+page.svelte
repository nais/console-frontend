<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams, limitOffset } from '$lib/pagination';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	export let data: PageData;
	$: ({ Deploys } = data);
	$: deploys = $Deploys.data?.deployments;
	$: ({ limit, offset } = limitOffset($Deploys.variables));
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
		<Table size="small" zebraStripes={true}>
			<Thead>
				<Th>Resource(s)</Th>
				<Th>Created</Th>
				<Th>Team</Th>
				<Th>Cluster</Th>
				<Th>Status</Th>
				<!--Th>Links</Th-->
			</Thead>
			<Tbody>
				{#each deploys.nodes as node}
					{#if node.id === PendingValue}
						<Tr>
							{#each new Array(5).fill('text') as variant}
								<Td><Skeleton {variant} /></Td>
							{/each}
						</Tr>
					{:else}
						<Tr>
							<Td>
								{#each node.resources as resource}
									<span style="color:var(--a-gray-600)">{resource.kind}:</span>
									{#if resource.kind === 'Application'}
										<a href="/team/{node.team.slug}/{node.env}/app/{resource.name}/deploys"
											>{resource.name}</a
										>
									{:else if resource.kind === 'Naisjob'}
										<a href="/team/{node.team.slug}/{node.env}/job/{resource.name}/deploys"
											>{resource.name}</a
										>
									{:else}
										{resource.name}
									{/if}
									<br />
								{/each}
							</Td>
							<Td><Time time={node.created} distance={true} /></Td>
							<Td>
								<a href="/team/{node.team.slug}/deploy">{node.team.slug}</a>
							</Td>
							<Td>{node.env}</Td>

							{#if node.statuses.length === 0}
								<Td><DeploymentStatus status={'unknown'} /></Td>
							{:else}
								<Td><DeploymentStatus status={node.statuses[0].status} /></Td>
							{/if}
							<!--Td>
								{#if edge.node.repository}
									<Button
										size="xsmall"
										variant="secondary"
										href="https://github.com/{node.repository}"
										as="a"
									>
										<svelte:fragment slot="icon-left"><BranchingIcon /></svelte:fragment
										>Repo</Button
									>
								{/if}
							</Td-->
						</Tr>
					{/if}
				{/each}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={deploys.pageInfo}
			{limit}
			{offset}
			changePage={(page) => {
				changeParams({ page: page.toString() });
			}}
		/>
	{/if}
</Card>
