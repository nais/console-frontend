<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import {
		Alert,
		Button,
		Skeleton,
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

	$: ({ JobDeploys } = data);
	$: env = $page.params.env;
	$: job = $page.params.app;
</script>

{#if $JobDeploys.errors}
	<Alert variant="error">
		{#each $JobDeploys.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if $JobDeploys.data}
	<Card>
		<Table size="small" zebraStripes>
			<Thead>
				<Th>Resource(s)</Th>
				<Th>Created</Th>
				<Th>Status</Th>
				<Th>Link</Th>
			</Thead>
			<Tbody>
				{#if $JobDeploys.data.naisjob.name === PendingValue}
					{#each new Array(5).fill('text') as type}
						<Tr>
							{#each new Array(type) as variant}
								<Td>
									<Skeleton {variant} />
								</Td>
							{/each}
						</Tr>
					{/each}
				{:else if $JobDeploys.data.naisjob.deployInfo.history.__typename === 'DeploymentList'}
					{#each $JobDeploys.data.naisjob.deployInfo.history.nodes as node}
						<Tr>
							<Td>
								{#each node.resources as resource}
									<span style="color:var(--a-gray-600)">{resource.kind}:</span>
									{resource.name}
									<br />
								{/each}
							</Td>
							<Td>
								<Time time={new Date(node.created)} distance={true} />
							</Td>
							<Td>
								<Tooltip content={node.statuses[0].message || ''}
									><DeploymentStatus status={node.statuses[0].status} /></Tooltip
								>
							</Td>
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
						</Tr>
					{/each}
				{:else}
					<Alert variant="error">
						Could not fetch deploys for {job} in {env}.
					</Alert>
				{/if}
			</Tbody>
		</Table>
	</Card>
{/if}
