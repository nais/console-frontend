<script>
	import { page } from '$app/stores';
	import { appSpec } from '$lib/mock/appSpec';
	import Card from '$lib/Card.svelte';
	import { Body, DataCell, Header, HeaderCell, Row, Table } from '@nais/ds-svelte';
	$: app = $page.params.app;
	$: env = $page.params.env;
</script>

<Card>
	<h3>Instances of {app} in {env}</h3>
	<Table>
		<Header>
			<HeaderCell>Instance</HeaderCell>
			<HeaderCell>status</HeaderCell>
			<HeaderCell>reason</HeaderCell>
		</Header>
		<Body>
			{#each appSpec.instances as instance}
				<Row>
					<DataCell>{instance.name}</DataCell>
					<DataCell>{instance.status}</DataCell>
					<DataCell>{instance.reason || ''}</DataCell>
				</Row>
			{/each}
		</Body>
	</Table>

	<p>2 running</p>
	<p>Min. 2 / Max 8 <a href="/">Adjust</a></p>
</Card>
