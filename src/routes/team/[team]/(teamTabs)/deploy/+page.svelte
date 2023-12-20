<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Status from '$lib/DeploymentStatus.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams, limitOffset } from '$lib/pagination';
	import {
		Alert,
		Button,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { BranchingIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: team = $page.params.team;
	$: ({ TeamDeployments } = data);
	$: teamData = $TeamDeployments.data?.team;
	$: ({ limit, offset } = limitOffset($TeamDeployments.variables));
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
				<Th>Link</Th>
			</Thead>
			<Tbody>
				{#each teamData.deployments.nodes as node}
					<Tr>
						{#if node.id === PendingValue}
							{#each new Array(5).fill('text') as variant}
								<Td><Skeleton {variant} /></Td>
							{/each}
						{:else}
							<Td>
								{#each node.resources as resource}
									<span style="color:var(--a-gray-600)">{resource.kind}:</span>
									{#if resource.kind === 'Application'}
										<a href="/team/{team}/{node.env}/app/{resource.name}/deploys">{resource.name}</a
										>
									{:else if resource.kind === 'Naisjob'}
										<a href="/team/{team}/{node.env}/job/{resource.name}/deploys">{resource.name}</a
										>
									{:else}
										{resource.name}
									{/if}
									<br />
								{/each}
							</Td>
							<Td>
								<Time time={new Date(node.created)} distance={true} />
							</Td>
							<Td>{node.env}</Td>
							{#if node.statuses.length === 0}
								<Td><Status status={'unknown'} /></Td>
							{:else}
								<Td><Status status={node.statuses[0].status} /></Td>
							{/if}
							<Td>
								{#if node.repository}
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
							</Td>
						{/if}
					</Tr>
				{/each}
			</Tbody>
		</Table>

		<Pagination
			pageInfo={teamData.deployments.pageInfo}
			{limit}
			{offset}
			changePage={(page) => {
				changeParams({ page: page.toString() });
			}}
		/>
	</Card>
{/if}
