<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { Body, DataCell, Header, HeaderCell, Row, Table } from '@nais/ds-svelte';
	import Status from '../[env]/[app]/Status.svelte';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Workloads } = data);
	$: $Workloads.data?.team.apps.edges.sort((a) => {
		return a.node.instances.every((instance) => instance.status === 'Running') ? 1 : -1;
	});
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
							<Status app={edge.node} loading={false} />
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
		<Pagination
			pageInfo={$Workloads.data.team.apps.pageInfo}
			totalCount={$Workloads.data.team.apps.totalCount}
			on:nextPage={() => {
				if (!$Workloads.pageInfo.hasNextPage) return;
				Workloads.loadNextPage();
			}}
			on:previousPage={() => {
				if (!$Workloads.pageInfo.hasPreviousPage) return;
				Workloads.loadPreviousPage();
			}}
		/>
	{:else}
		<p>loading...</p>
	{/if}
</Card>
