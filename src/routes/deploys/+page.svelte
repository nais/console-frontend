<script lang="ts">
	import {
		Body,
		Chips,
		DataCell,
		Header,
		HeaderCell,
		Removable,
		Row,
		Table,
		Tag
	} from '@nais/ds-svelte';
	import type { SortState } from '@nais/ds-svelte/dist/components/Table/Table.svelte';
	let sortState: SortState = {
		orderBy: 'name',
		direction: 'ascending'
	};
</script>

<h1>deploys</h1>
<Table sort={sortState} on:sortChange={() => {}}>
	<Header>
		<HeaderCell>Resource(s)</HeaderCell>
		<HeaderCell>Created</HeaderCell>
		<HeaderCell sortable={true} scope="col" sortKey="team">Team</HeaderCell>
		<HeaderCell sortable={true} scope="col" sortKey="cluster">Cluster</HeaderCell>
		<HeaderCell sortable={true} scope="col" sortKey="team">Status</HeaderCell>
	</Header>
	<Body>
		<Row>
			<DataCell>pensjonzstuff</DataCell>
			<DataCell>igor</DataCell>
			<DataCell><a href="/team/team-a/deploy">team-a</a></DataCell>
			<DataCell>dev</DataCell>
			<DataCell><Tag variant="neutral">good to go</Tag></DataCell>
		</Row>
	</Body>
</Table>
