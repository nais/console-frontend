<script lang="ts">
	import Card from '$lib/Card.svelte';
	import SecretField from '$lib/components/SecretField.svelte';
	import { Table, Thead, Tr, Td, Tbody, Th, Button } from '@nais/ds-svelte-community';
	import TrExpander from './TrExpander.svelte';
</script>

<div class="grid">
	<Card columns={12}>
		<h3>Prod</h3> 
		<Table size="small">
			<Thead>
				<Th style="width: 50px"></Th>
				<Th>Name</Th>
				<Th>Secret</Th>
				<Th>Action</Th>
				
			</Thead>
			<Tbody>

				<TrExpander>
					<svelte:fragment slot="row-content">
						<Td><input type="text" value="MY_SECRET"/></Td>
						
					<Td><SecretField value="fooo"/></Td>
					<Td>
						<button>Edit</button><button>Delete</button><button>Save</button>
					</Td>		
				</svelte:fragment>
					<dl slot="expander-content">
						<dt><input type="text" value="mysecret"/><dt>
						<dd></dd>	

					</dl>
					
				</TrExpander>
				<TrExpander>
					<svelte:fragment slot="row-content">
						<Td><input type="text" value="MY_SECRET"/></Td>
						
					<Td><input type="password" value="hunter2"/></Td>
						
				</svelte:fragment>
					<p slot="expander-content">This secret is used in several places</p>
					
				</TrExpander>
				<TrExpander>
					<svelte:fragment slot="row-content">
						<Td><input type="text" value="MY_SECRET"/></Td>
						
					<Td><input type="password" value="hunter2"/></Td>
						
				</svelte:fragment>
					<p slot="expander-content">This secret is used in several places</p>
					
				</TrExpander>
				<TrExpander>
					<svelte:fragment slot="row-content">
						<Td><input type="text" value="MY_SECRET"/></Td>
						
					<Td><input type="password" value="hunter2"/></Td>
						
				</svelte:fragment>
					<p slot="expander-content">This secret is used in several places</p>
					
				</TrExpander>

	
				
			</Tbody>
		</Table>
		<Button>Add New Secret</Button>
	</Card>
	<Card columns={12}>
		<h3>Dev</h3>
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
