<script context="module" lang="ts">

	export type updateState =
		| {
		env: {
			name: string;
		};
		secrets: {
			name: string;
			id: string;
			apps: [string];
			data: {
				key: string;
				value: string;
				editState: editState;
			}[];
		}[];
	}[]
		| undefined;

	export enum editState {
		Deleted, Added, Unchanged
		// This should also track state for individual edits for keys and values
		// e.g Modified with styles for changed keys and or values. 
	}


</script>

<script lang="ts">
	/**
	 * TODOS:
	 * - Refactor data model - we don't need to deepcopy(??????)
	 * - Push fetching down to the leaves;
	 *    - Initial fetch should only list envs and secret names per env (no data)
	 *    - Data is fetched per secret when the expander is opened
	 * - Refactor away the i,j,k madness, replace it with manipulating objects by ID
	 */

	import Card from '$lib/Card.svelte';
	import { Table, Thead, Td, Tbody, Th, Button, Heading, Alert } from '@nais/ds-svelte-community';
	import { TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	import { graphql, type Secrets$result } from '$houdini';
	import { page } from '$app/stores';
	import Confirm from '$lib/components/Confirm.svelte';

	import AddSecret from './AddSecret.svelte';
	import NewSecretEntry from './NewSecretEntry.svelte';
	import SecretField from './SecretField.svelte';
	import TrExpander from './TrExpander.svelte';

	export let data: PageData;

	$: ({ Secrets } = data);

	$: mkUpdate($Secrets.data?.secrets);


	let update: updateState;

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

	// (obj: Record<string, any>) => obj[key];
	let addSecretOpen = (update) ? update.reduce((acc: Record<string, boolean>, curr) => ({ ...acc, [curr.env.name]: false }), {} ) : {};
	let deleteSecretOpen = (update) ? update.reduce((acc: Record<string, boolean>, curr) => ({ ...acc, [curr.env.name]: false}), {} ) : {};
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
							addSecretOpen[secrets.env.name] =  true;
						}}
					>
						Add secret
					</Button>
				</div>

				<AddSecret
					refetch={() => Secrets.fetch({})}
					bind:open={addSecretOpen[secrets.env.name]}
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
								<div>
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
												if (update) {
												update[i].secrets[j].data = update[i].secrets[j].data.filter((kv) => kv.editState !== editState.Deleted)
												}
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

												if (update) update[i].secrets[j].data = []
												Secrets.fetch();
											}}
										>
											Confirm
										</Button>
										<Button
											variant="secondary"
											size="small"
											on:click={async () => {
												if (update )update[i].secrets[j].data = [];
												Secrets.fetch();
											}}
										>
											Cancel
										</Button>
										<Button
											variant="danger"
											size="small"
											on:click={() => {
												deleteSecretOpen[secrets.env.name] = true;
											}}
										>
											<TrashIcon />
										</Button>
										<Confirm
											bind:open={deleteSecretOpen[secrets.env.name]}
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
											<svelte:fragment slot="header">
												<Heading>Delete secret</Heading>
											</svelte:fragment>
											Are you sure you want to delete the secret <b>{secret.name}</b> from <b>{secrets.env.name}</b>?
										</Confirm>
									</div>
								</div>
								<div class="apps">
									{#if secret.apps.length}<h4>Used in</h4>
										{:else} <Alert size="small" variant="info">Unused secret</Alert>
									{/if}

									<ul>
										{#each secret.apps as app}
											<li><a href="/team/{team}/{secrets.env.name}/app/{app}">{app}</a></li>
										{/each}
									</ul>
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

    div[slot="expander-content"] {
        display: flex;
        justify-content: space-evenly;
    }

    .apps {
				padding: 16px;
        width: 400px;
    }

    .apps ul {
        list-style: none;
				margin-block-start: 0;
    }

		.apps h4 {
				margin: 0 0 8px;
		}


</style>
