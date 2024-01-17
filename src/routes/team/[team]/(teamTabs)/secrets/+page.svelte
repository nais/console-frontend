<script lang="ts">
	import Card from '$lib/Card.svelte';
	import SecretField from '$lib/components/SecretField.svelte';
	import { Table, Thead, Tr, Td, Tbody, Th, Button, TextField } from '@nais/ds-svelte-community';
	import TrExpander from './TrExpander.svelte';

	import { TrashIcon } from '@nais/ds-svelte-community/icons';
	import NewSecretEntry from './NewSecretEntry.svelte';
	import type { PageData } from './$houdini';
	import { graphql, type Secrets$result } from '$houdini';
	import { page } from '$app/stores';

	export let data: PageData;

	$: ({ Secrets } = data);

	$: mkUpdate($Secrets.data?.secrets);
    
	type update =
		| {
				env: string;
				secrets: {
					name: string;
					id: string;
					data: {
						key: string;
						value: string;
					}[];
				}[];
		  }[]
		| undefined;

	let update: update;

	let mkUpdate = (secret: Secrets$result['secrets'] | undefined | null) => {
		if ( !secret) {
			return;
		}
		
		update = JSON.parse(JSON.stringify(secret));
		console.log("yes", update )
	};
	const deleteSecret = graphql(`
		mutation deleteSecret($name: String!, $team: Slug!, $env: String!) {
			deleteSecret(name: $name, team: $team, env: $env)
		}
	`);

	const updateSecret = graphql(`
		mutation updateSecret(
			$name: String!
			$team: Slug!
			$env: String!
			$data: [SecretTupleInput!]!
		) {
			updateSecret(name: $name, team: $team, env: $env, data: $data) {
				id
			}
		}
	`);

	let team = $page.params.team;
</script>

{#if $Secrets.data}
	<div class="grid">
		{#each $Secrets.data.secrets as secrets, i}
			<Card columns={12}>
				<h3>{secrets.env.name}</h3>
				<Table size="small">
					<Thead>
						<Th style="width: 50px"></Th>
						<Th>Name</Th>
					</Thead>
					<Tbody>
						{#each secrets.secrets as secret, j}
							<TrExpander>
								<svelte:fragment slot="row-content">
									<Td>{secret.name}</Td>
								</svelte:fragment>
								<div slot="expander-content">
									{#each secret.data as data, k}
										<SecretField i={i} j={j} k={k} key={data.key} value={data.value} bind:update={update} />
									{/each}
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
									<Button
										variant="primary"
										size="small"
										on:click={async () => {
											await updateSecret.mutate({
												name: secret.name,
												team: team,
												env: secrets.env.name,
												data: []
											});
											Secrets.fetch();
										}}
									>
										<TrashIcon />
									</Button>
									<Button
										variant="danger"
										size="small"
										on:click={async () => {
											await deleteSecret.mutate({
												name: secret.name,
												team: team,
												env: secrets.env.name
											});
											Secrets.fetch();
										}}
									>
										<TrashIcon />
									</Button>
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
</style>
