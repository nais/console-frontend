<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Loading from '$lib/Loading.svelte';
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
	import { Branching } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ JobDeploys } = data);
	$: naisjob = $JobDeploys.data?.naisjob;
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
		<Table zebraStripes={true}>
			<Thead>
				<Th>Resource(s)</Th>
				<Th>Created</Th>
				<Th>Status</Th>
				<Th>Link</Th>
			</Thead>
			<Tbody>
				{#if $JobDeploys.data.naisjob.name === PendingValue}
					{#each new Array(5) as _}
						<Tr>
							{#each new Array(4) as _}
								<Td>
									<Loading />
								</Td>
							{/each}
						</Tr>
					{/each}
				{:else if $JobDeploys.data.naisjob.deployInfo.history.__typename === 'DeploymentConnection'}
					{#each $JobDeploys.data.naisjob.deployInfo.history.edges as edge}
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
