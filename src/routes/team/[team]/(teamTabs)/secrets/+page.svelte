<script lang="ts">
	/**
	 * TODOS:
	 * - Refactor data model - we don't need to deepcopy
	 * - Push fetching down to the leaves;
	 *    - Initial fetch should only list envs and secret names per env (no data)
	 *    - Data is fetched per secret when the expander is opened
	 * - Refactor away the i,j,k madness
	 * - Replace it with manipulating objects by ID
	 * - Fix the addSecretOpen and deleteSecretOpen so that we don't need the indices workaround
	 * - Fix the expanders losing their state on confirm/cancel
	 * - Make type for the 'update' record
	 * - Fix 'npm run check' tslint errors
	 * - The KV field is really a (DELETED, ADDED, UNCHANGED, MODIFIED) field
	 * 		- the current state of the data type does not reflect this
	 * 		- e.g: a KV field may be both added and deleted at the same time
	 */

	import Card from '$lib/Card.svelte';
	import SecretField from './SecretField.svelte';
	import { Table, Thead, Td, Tbody, Th, Button, Heading } from '@nais/ds-svelte-community';
	import TrExpander from './TrExpander.svelte';

	import { TrashIcon } from '@nais/ds-svelte-community/icons';
	import NewSecretEntry from './NewSecretEntry.svelte';
	import type { PageData } from './$houdini';
	import { graphql, type Secrets$result } from '$houdini';
	import { page } from '$app/stores';
	import AddSecret from './AddSecret.svelte';
	import Confirm from '$lib/components/Confirm.svelte';

	export let data: PageData;

	$: ({ Secrets } = data);

	$: mkUpdate($Secrets.data?.secrets);

	type update =
		| {
				env: {
					name: string;
				};
				secrets: {
					name: string;
					id: string;
					data: {
						key: string;
						value: string;
						added?: boolean;
						deleted?: boolean;
					}[];
				}[];
		  }[]
		| undefined;

	let update: update;

	let mkUpdate = (secret: Secrets$result['secrets'] | undefined | null) => {
		if (!secret) {
			return;
		}

		// TOdo: I cant even, surely we can avoid a deepcopy here by mappy-reducy
		update = JSON.parse(JSON.stringify(secret));
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
				data {
					key
					value
				}
			}
		}
	`);

	let team = $page.params.team;
	// TODO: this should really be update.map( x => {[x.env]: false}) but v0v
	let addSecretOpen = [0, 1, 2, 3, 4, 5].map((x) => ({ [x]: false }));
	let deleteSecretOpen = [0, 1, 2, 3, 4, 5].map((x) => ({ [x]: false }));
</script>

{#if update}
	<div class="grid">
		{#each update as secrets, i}
			<Card columns={12}>
				<div class="heading">
					<h3>{secrets.env.name}</h3>
					<Button
						class="add-secret"
						variant="primary"
						size="small"
						on:click={() => {
							addSecretOpen[i] = { [i]: true };
						}}
					>
						Add secret
					</Button>
				</div>

				<AddSecret
					refetch={() => Secrets.fetch({})}
					bind:open={addSecretOpen[i][i]}
					bind:team
					env={secrets.env.name}
				/>

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
									<div class="secrets-edit">
										{#each secret.data as data, k}
											<SecretField {i} {j} {k} bind:key={data.key} bind:value={data.value} bind:update />
										{/each}
										<NewSecretEntry {i} {j} bind:update></NewSecretEntry>
									</div>
									<div class="secrets-edit-buttons">
										<Button
											variant="primary"
											size="small"
											on:click={async () => {
												update[i].secrets[j].data = update[i].secrets[j].data.filter((kv) => kv.deleted !== true)
												update
													? await updateSecret.mutate({
															name: secret.name,
															team: team,
															env: secrets.env.name,
															data: update[i].secrets[j].data.map((kv) => ({
																key: kv.key,
																value: kv.value
															}))
													  })
													: () => {};
												update = undefined;
												Secrets.fetch();
											}}
										>
											Confirm
										</Button>
										<Button
											variant="secondary"
											size="small"
											on:click={async () => {
												update = undefined;
												Secrets.fetch();
											}}
										>
											Cancel
										</Button>
										<Button
											variant="danger"
											size="small"
											on:click={() => {
												deleteSecretOpen[i] = { [i]: true };
											}}
										>
											<TrashIcon />
										</Button>
										<Confirm
											bind:open={deleteSecretOpen[i][i]}
											confirmText="Delete"
											variant="danger"
											on:confirm={async () => {
												await deleteSecret.mutate({
													name: secret.name,
													team: team,
													env: secrets.env.name
												});
												Secrets.fetch();
											}}
										>
											<svelte:fragment slot="header"><Heading>Delete secret</Heading></svelte:fragment>
											Are you sure you want to delete the secret <b>{secret.name}</b> from <b>{secrets.env.name}</b>?
										</Confirm>
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

	:global(.add-secret) {
		display: inline-block;
	}

	.heading {
		display: flex;
		justify-content: space-between;
	}

	.secrets-edit-buttons {
		margin: 16px 0 0 16px;
	}
</style>
