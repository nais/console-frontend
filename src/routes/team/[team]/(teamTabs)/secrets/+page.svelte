<script lang="ts">
	import Card from '$lib/Card.svelte';
	import SecretField from '$lib/components/SecretField.svelte';
	import { Table, Thead, Tr, Td, Tbody, Th, Button, TextField } from '@nais/ds-svelte-community';
	import TrExpander from './TrExpander.svelte';

	import { TrashIcon, PencilIcon } from '@nais/ds-svelte-community/icons';
	import NewSecretEntry from './NewSecretEntry.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ Secrets } = data);
</script>

{#if $Secrets.data}
	<div class="grid">
		{#each $Secrets.data.secrets as secrets}
			<Card columns={12}>
				<h3>{secrets.env.name}</h3>
				<Table size="small">
					<Thead>
						<Th style="width: 50px"></Th>
						<Th>Name</Th>
					</Thead>
					<Tbody>
						{#each secrets.secrets as secret}
							<TrExpander>
								<svelte:fragment slot="row-content">
									<Td>{secret.name}</Td>
								</svelte:fragment>
								<div slot="expander-content">
									{#each secret.data as data}
										<SecretField key={data.key} value={data.value} />
										<NewSecretEntry></NewSecretEntry>
									{/each}
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
						{/each}
					</Tbody>
				</Table>
			</Card>
		{/each}
	</div>
{/if}

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
