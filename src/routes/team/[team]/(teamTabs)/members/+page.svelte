<script>
	import Card from '$lib/Card.svelte';
	import { teamSpec } from '$lib/mock/team';
	import { Body, DataCell, Header, HeaderCell, Row, Table } from '@nais/ds-svelte';
</script>

<Card>
	<h3>memeBears</h3>
	<Table>
		<Header>
			<HeaderCell>Name</HeaderCell>
			<HeaderCell>E-mail</HeaderCell>
			<HeaderCell>Role</HeaderCell>
		</Header>
		<Body>
			{#each teamSpec.team.members as member}
				<Row>
					<DataCell>{member.user.name}</DataCell>
					<DataCell>{member.user.email}</DataCell>
					<DataCell>{member.role.toLowerCase()}</DataCell>
				</Row>
			{/each}
		</Body>
	</Table>
</Card>
