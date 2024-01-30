<script lang="ts">
	/**
	 * TODOS:
	 * - Refactor data model - we don't need to deepcopy(??????)
	 * - Push fetching down to the leaves;
	 *    - Initial fetch should only list envs and secret names per env (no data)
	 *    - Data is fetched per secret when the expander is opened
	 * - Refactor away the i,j,k madness, replace it with manipulating objects by ID
	 * - Error handling: display error messages from the server
	 * - Cancel and Add secret closes the expander because we have a top level loading state check that
	 *   shows the loader component. It would be nice to disambiguate on refetch/initialfetch
	 * - Should key in the secret field be editable? Might be confusing for end-users
	 */

	import Card from '$lib/Card.svelte';
	import { Table, Thead, Tbody, Th, Button, Heading, Alert, Loader } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	import { graphql, type Secrets$result } from '$houdini';
	import { page } from '$app/stores';
	import Confirm from '$lib/components/Confirm.svelte';

	import AddSecret from './AddSecret.svelte';
	import NewSecretKv from './NewSecretKv.svelte';
	import SecretKv from './SecretKv.svelte';
	import TrExpander from './TrExpander.svelte';
	import { mergeChanges, type updateState } from './state-machinery';

	export let data: PageData;

	$: ({ Secrets } = data);

	$: mkUpdate($Secrets.data?.secrets);

	let update: updateState;
	$: changes = [];

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
	let addSecretOpen = (update) ? update.reduce((acc: Record<string, boolean>, curr) => ({
		...acc,
		[curr.env.name]: false
	}), {}) : {};
	let deleteSecretOpen = (update) ? update.reduce((acc: Record<string, boolean>, curr) => ({
		...acc,
		[curr.env.name]: false
	}), {}) : {};
</script>

{#if $Secrets.errors}
	{$Secrets.errors[0].message}
{:else}
	{#if $Secrets.fetching}
		<Loader></Loader>
	{:else }
		{#if update}
			<div class="grid">
				{#each update as secrets, envIndex}
					{@const env = secrets.env.name}
					<Card columns={12}>
						<div class="heading">
							<h3>{env}</h3>
							<Button
								class="add-secret"
								variant="primary"
								size="small"
								on:click={() => {
							addSecretOpen[env] =  true;
						}}
							>
								Add secret
							</Button>
						</div>

						<AddSecret
							refetch={() => Secrets.fetch({})}
							bind:open={addSecretOpen[env]}
							bind:team
							env={env}
						/>

						<Table size="small">
							<Thead>
							<Th style="width: 50px"></Th>
							<Th>Name</Th>
							</Thead>
							<Tbody>
							{#each secrets.secrets as secret, secretIndex}
								<TrExpander>
									<svelte:fragment slot="row-content">
										{secret.name}
									</svelte:fragment>
									<div slot="expander-content">
										<div>
											<div class="secrets-edit">
												{#each secret.data as data}
													<SecretKv {env} secret={secret.name} bind:key={data.key}
																		bind:value={data.value} bind:changes />
												{/each}
												{#each changes.filter((c) => c.type === 'AddKv' && c.data.env === env && c.data.secret === secret.name) as change}
													<SecretKv {env} secret={change.data.secret} bind:key={change.data.key}
																		bind:value={change.data.value} bind:changes />
												{/each}
												<NewSecretKv {env} secret={secret.name} bind:changes></NewSecretKv>
											</div>
											<div class="secrets-edit-buttons">
												<Button
													variant="primary"
													size="small"
													on:click={ async () => {
														if (update) {
															// TODO: get rid of the indices and use state machine instead for updating key/values
															//  also pass key/values down to child components instead of using 'update'
															let mutation = changes.reduce(mergeChanges, update);

															await updateSecret.mutate({
																name: secret.name,
																team: team,
																env: env,
																data: mutation[envIndex].secrets[secretIndex].data
															})

															changes = changes.filter((c) => c.data.env + c.data.secret !== env + secret.name);
														}
													}}
												>
													Update
												</Button>
												<Button
													variant="secondary"
													size="small"
													on:click={() => {
														 changes = changes.filter((c) => c.data.env + c.data.secret !== env + secret.name);
													}}
												>
													Cancel
												</Button>
												<Button
													variant="danger"
													size="small"
													on:click={() => {
												deleteSecretOpen[env] = true;
											}}
												>
													Delete
												</Button>
												<Confirm
													bind:open={deleteSecretOpen[env]}
													confirmText="Delete"
													variant="danger"
													on:confirm={async () => {
												await deleteSecret.mutate({
													name: secret.name,
													team: team,
													env: env
												});
												Secrets.fetch();
											}}
												>
													<svelte:fragment slot="header">
														<Heading>Delete secret</Heading>
													</svelte:fragment>
													Are you sure you want to delete the secret <b>{secret.name}</b> from <b>{env}</b>?
												</Confirm>
											</div>
										</div>
										<div class="apps">
											{#if secret.apps.length}<h4>Used in</h4>
											{:else}
												<Alert size="small" variant="info">Unused secret</Alert>
											{/if}

											<ul>
												{#each secret.apps as app}
													<li><a href="/team/{team}/{env}/app/{app}">{app}</a></li>
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
	{/if}
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
        padding: 32px 0;
    }

    .secrets-edit-buttons > :global(button) {
        margin-right: 32px;
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
