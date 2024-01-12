<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { Table, Thead, Tr, Td, Tbody, Th } from '@nais/ds-svelte-community';
</script>

<div class="grid">
	<Card columns={12}>
		<Table size="small">
			<Thead>
				<Th>Name</Th>
				<Th>Value</Th>
				<Th>Action</Th>
			</Thead>
			<Tbody>
				<Tr>
					<Td>No apps found</Td>
					<Td>No apps found</Td>
					<Td>No apps found</Td>
				</Tr>
			</Tbody>
		</Table>
	</Card>
	<Card columns={12}>
		<Table size="small">
			<Thead>
				<Th>Name</Th>
				<Th>Value</Th>
				<Th>Action</Th>
			</Thead>
			<Tbody>
				<Tr>
					<Td>No apps found</Td>
					<Td>No apps found</Td>
					<Td>No apps found</Td>
				</Tr>
			</Tbody>
		</Table>
	</Card>
	<summary>
		<details>fooo</details>
		Stuff
	</summary>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
