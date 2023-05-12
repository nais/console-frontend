<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import Sort from '$lib/icons/Sort.svelte';
	import { Table, Header, HeaderCell, Body, Row, DataCell, Button } from '@nais/ds-svelte';
	import { ChevronRight, ChevronLeft } from '@nais/ds-svelte/icons';
	import Status from '../[env]/[app]/Status.svelte';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Workloads } = data);

	$: currentPage = 1;
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
		<div class="pagination">
			<Button
				size="xsmall"
				on:click={() => {
					if (!$Workloads.pageInfo.hasPreviousPage) return;
					Workloads.loadPreviousPage();
					currentPage--;
				}}
				disabled={!$Workloads.pageInfo.hasPreviousPage}
				><svelte:fragment slot="icon-left"
					><ChevronLeft aria-label="Previous page" /></svelte:fragment
				></Button
			>
			<span>Page {currentPage} of {Math.ceil($Workloads.data.team.apps.totalCount / 10)}</span>
			<Button
				size="xsmall"
				on:click={() => {
					if (!$Workloads.pageInfo.hasNextPage) return;
					Workloads.loadNextPage();
					currentPage++;
				}}
				disabled={!$Workloads.pageInfo.hasNextPage}
			>
				<svelte:fragment slot="icon-left"><ChevronRight aria-label="Next page" /></svelte:fragment
				></Button
			>
		</div>
	{:else}
		<p>loading...</p>
	{/if}
</Card>

<style>
	.pagination {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
		gap: 1rem;
	}
</style>
