<script lang="ts">
	import Card from '$lib/Card.svelte';
	import SecretField from '$lib/components/SecretField.svelte';
	import { Table, Thead, Tr, Td, Tbody, Th, Button,TextField } from '@nais/ds-svelte-community';
	import TrExpander from './TrExpander.svelte';

	import { TrashIcon, PencilIcon } from '@nais/ds-svelte-community/icons';
	import NewSecretEntry from './NewSecretEntry.svelte';
</script>

<div class="grid">
	<Card columns={12}>
		<h3>Prod</h3>
		<Table size="small">
			<Thead>
				<Th style="width: 50px"></Th>
				<Th>Name</Th>
				<Th>Updated</Th>
			</Thead>
			<Tbody>
				<TrExpander>
					<svelte:fragment slot="row-content">
						<Td>Some-secret</Td>
						<Td>Alice</Td>
					</svelte:fragment>
					<div slot="expander-content">
						<SecretField key="foo" value="bar"/>
						<NewSecretEntry></NewSecretEntry>
						<div>
							<details>
								<summary>Audit log</summary>
								Carl did a thign
							</details>
							<details>
								<summary>Used by</summary>
								<p>My app</p>
								<p>Other App</p>
							</details>
						</div>
					</div>
				</TrExpander>
			</Tbody>
		</Table>
	</Card>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.entry {
		display: flex;

	}
</style>
