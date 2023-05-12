<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import Sort from '$lib/icons/Sort.svelte';
	import { Table, Header, HeaderCell, Body, Row, DataCell } from '@nais/ds-svelte';
	import Status from '../[env]/[app]/Status.svelte';
	import type { PageData } from './$houdini';
	import type { SortState } from '@nais/ds-svelte/dist/components/Table/Table.svelte';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Workloads } = data);

	let sortState: SortState = {
		orderBy: 'workloads',
		direction: 'ascending'
	};
</script>

<Card>
	<h4>Applications</h4>
	{#if $Workloads.data}
		<Table>
			<Header>
				<HeaderCell>Workload</HeaderCell>
				<HeaderCell>Env</HeaderCell>
				<HeaderCell>Instances</HeaderCell>
				<HeaderCell>Deployed</HeaderCell>
			</Header>
			<Body>
				{#each $Workloads.data.team.apps.edges as edge}
					<Row>
						<DataCell
							><a href="/team/{teamName}/{edge.node.env.name}/{edge.node.name}">{edge.node.name}</a
							></DataCell
						>
						<DataCell>{edge.node.env.name}</DataCell>
						<DataCell>
							<Status app={edge.node} />
						</DataCell>
						<DataCell
							>{#if edge.node.deployed}
								<Time time={edge.node.deployed} distance={true} />
							{/if}
						</DataCell>
					</Row>
				{/each}
			</Body>
		</Table>
		{#if $Workloads.pageInfo.hasPreviousPage}
			<button on:click={() => Workloads.loadPreviousPage()}> previous </button>
		{/if}
		{#if $Workloads.pageInfo.hasNextPage}
			<button on:click={() => Workloads.loadNextPage()}> next </button>
		{/if}
	{:else}
		<p>loading...</p>
	{/if}
</Card>
