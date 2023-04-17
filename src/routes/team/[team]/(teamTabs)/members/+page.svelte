<script>
	import Card from '$lib/Card.svelte';
	import Table from '$lib/Table.svelte';
	import Sort from '$lib/icons/Sort.svelte';
	import { teamSpec } from '$lib/mock/team';
</script>

<Card>
	<h3>memeBears</h3>
	<Table>
		<thead>
			<tr>
				<th><span>Name <Sort size="1.5rem" /></span></th>
				<th><span>e-mail <Sort size="1.5rem" /></span></th>
				<th><span>Role <Sort size="1.5rem" /></span></th>
			</tr>
		</thead>
		<tbody>
			{#each teamSpec.team.members as member}
				<tr>
					<td>{member.user.name}</td>
					<td>{member.user.email}</td>
					<td>{member.role.toLowerCase()}</td>
				</tr>
			{/each}
		</tbody>
	</Table>
</Card>

<style>
	thead th span {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	thead tr th {
		padding-left: 1rem;
	}
</style>
