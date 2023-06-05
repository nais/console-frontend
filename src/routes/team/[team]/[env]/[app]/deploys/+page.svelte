<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Body, Button, DataCell, Header, HeaderCell, Row, Table, Tooltip } from '@nais/ds-svelte';
	import { Branching } from '@nais/ds-svelte/icons';
	import type { PageData } from './$houdini';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	export let data: PageData;

	$: ({ AppDeploys } = data);
	$: team = $page.params.team;
	$: env = $page.params.env;
	$: app = $page.params.app;
</script>

{#if $AppDeploys.errors}
	<h3>No deploys found</h3>
	{#each $AppDeploys.errors as error}
		<p>{error.message}</p>
	{/each}
{/if}

{#if $AppDeploys.data}
	<Card>
		<Table zebraStripes={true}>
			<Header>
				<HeaderCell>Resource(s)</HeaderCell>
				<HeaderCell>Created</HeaderCell>
				<HeaderCell>Status</HeaderCell>
				<HeaderCell>Link</HeaderCell>
			</Header>
			<Body>
				{#each $AppDeploys.data.app.deploys.edges as edge}
					<Row>
						{#if edge.node.id === PendingValue}
							{#each new Array(4) as _}
								<DataCell>
									<Loading />
								</DataCell>
							{/each}
						{:else}
							<DataCell>
								{#each edge.node.resources as resource}
									<span style="color:var(--a-gray-600)">{resource.kind}:</span>
									{resource.name}
									<br />
								{/each}
							</DataCell>
							<DataCell>
								<Time time={new Date(edge.node.created)} distance={true} />
							</DataCell>
							<DataCell
								><Tooltip content={edge.node.statuses[0].message || ''}
									><DeploymentStatus status={edge.node.statuses[0].status} /></Tooltip
								></DataCell
							>
							<DataCell>
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
							</DataCell>
						{/if}
					</Row>
				{/each}
			</Body>
		</Table>
	</Card>
{/if}
