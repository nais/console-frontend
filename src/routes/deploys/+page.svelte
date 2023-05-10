<script lang="ts">
	import { Body, Button, DataCell, Header, HeaderCell, Row, Table, Tag } from '@nais/ds-svelte';
	import type { SortState } from '@nais/ds-svelte/dist/components/Table/Table.svelte';
	import { Branching } from '@nais/ds-svelte/icons';
	import type { PageData } from './$houdini';
	import Time from '$lib/Time.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Card from '$lib/Card.svelte';
	let sortState: SortState = {
		orderBy: 'name',
		direction: 'ascending'
	};
	export let data: PageData;
	$: ({ Deploys } = data);
</script>

<Card>
	<h1>deploys</h1>
	{#if $Deploys.data}
		<Table zebraStripes={true}>
			<Header>
				<HeaderCell>Resource(s)</HeaderCell>
				<HeaderCell>Created</HeaderCell>
				<HeaderCell>Team</HeaderCell>
				<HeaderCell>Cluster</HeaderCell>
				<HeaderCell>Status</HeaderCell>
				<HeaderCell>Links</HeaderCell>
			</Header>
			<Body>
				{#each $Deploys.data.deployments.edges as edge}
					<Row>
						<DataCell>
							{#each edge.node.resources as resource}
								<span style="color:var(--a-gray-600)">{resource.kind}:</span>
								{#if resource.kind === 'Application'}
									<a href="/team/{edge.node.team.name}/{edge.node.env}/{resource.name}/deploys"
										>{resource.name}</a
									>
								{:else}
									{resource.name}
								{/if}
								<br />
							{/each}
						</DataCell>
						<DataCell><Time time={edge.node.created} distance={true} /></DataCell>
						<DataCell
							><a href="/team/{edge.node.team.name}/deploy">{edge.node.team.name}</a></DataCell
						>
						<DataCell>{edge.node.env}</DataCell>

						<DataCell><DeploymentStatus status={edge.node.statuses[0].status} /></DataCell>
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
	{:else}
		<p>loading...</p>
	{/if}
</Card>
