<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Status from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Body, Button, DataCell, Header, HeaderCell, Row, Table } from '@nais/ds-svelte';
	import { Branching } from '@nais/ds-svelte/icons';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ TeamDeployments } = data);
	$: team = $page.params.team;
</script>

{#if $TeamDeployments.errors}
	{#each $TeamDeployments.errors as error}
		<p>{error.message}</p>
	{/each}
{/if}
{#if $TeamDeployments.data}
	<Card>
		<Table zebraStripes={true}>
			<Header>
				<HeaderCell>Resource(s)</HeaderCell>
				<HeaderCell>Created</HeaderCell>
				<HeaderCell>Environment</HeaderCell>
				<HeaderCell>Status</HeaderCell>
				<HeaderCell>Link</HeaderCell>
			</Header>
			<Body>
				{#each $TeamDeployments.data.team.deployments.edges as edge}
					<Row>
						<DataCell>
							{#each edge.node.resources as resource}
								<span style="color:var(--a-gray-600)">{resource.kind}:</span>
								{#if resource.kind === 'Application'}
									<a href="/team/{team}/{edge.node.env}/{resource.name}/deploys">{resource.name}</a>
								{:else}
									{resource.name}
								{/if}
								<br />
							{/each}
						</DataCell>
						<DataCell>
							<Time time={new Date(edge.node.created)} distance={true} />
						</DataCell>
						<DataCell>{edge.node.env}</DataCell>
						<DataCell><Status status={edge.node.statuses[0].status} /></DataCell>
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
					</Row>
				{/each}
			</Body>
		</Table>
	</Card>
{/if}
