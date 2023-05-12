<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { Body, DataCell, Header, HeaderCell, Row, Table } from '@nais/ds-svelte';
	import type { PageData } from './$houdini';
	import Pagination from '$lib/Pagination.svelte';

	export let data: PageData;
	$: ({ Members } = data);
	$: console.log($Members.data);
</script>

{#if $Members.data}
	<Card>
		<h3>memeBears</h3>
		<Table>
			<Header>
				<HeaderCell>Name</HeaderCell>
				<HeaderCell>E-mail</HeaderCell>
				<HeaderCell>Role</HeaderCell>
			</Header>
			<Body>
				{#each $Members.data.team.members.edges as edge}
					<Row>
						<DataCell>{edge.node.name}</DataCell>
						<DataCell>{edge.node.email}</DataCell>
						<DataCell>{edge.node.role.toLowerCase()}</DataCell>
					</Row>
				{/each}
			</Body>
		</Table>
		<Pagination
			pageInfo={$Members.data.team.members.pageInfo}
			totalCount={$Members.data.team.members.totalCount}
			nextPage={() => {
				if (!$Members.pageInfo.hasNextPage) return;
				Members.loadNextPage();
			}}
			previousPage={() => {
				if (!$Members.pageInfo.hasPreviousPage) return;
				Members.loadPreviousPage();
			}}
		/>
	</Card>
{/if}
