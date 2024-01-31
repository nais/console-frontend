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
	 */

	import Card from '$lib/Card.svelte';
	import { Table, Thead, Tbody, Th, Button, Heading, Alert, Loader, Tooltip } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	import { graphql, type Secrets$result } from '$houdini';
	import { page } from '$app/stores';
	import Confirm from '$lib/components/Confirm.svelte';

	import CreateSecret from './CreateSecret.svelte';
	import AddSecretKv from './AddSecretKv.svelte';
	import SecretKv from './SecretKv.svelte';
	import TrExpander from './TrExpander.svelte';
	import { filterLocalAddKvs, mergeChanges, type operation, type updateState } from './state-machinery';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';

	export let data: PageData;

	$: ({ Secrets } = data);

	$: mkUpdate($Secrets.data?.secrets);

	let update: updateState = [];
	let changes: operation[]
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
	let createSecretOpen = (update) ? update.reduce((acc: Record<string, boolean>, curr) => ({
		...acc,
		[curr.env.name]: false
	}), {}) : {};
	let deleteSecretOpen = (update) ? update.reduce((acc: Record<string, boolean>, curr) => {
		return curr.secrets.reduce(
			(acc: Record<string, boolean>, currSecret) => ({
				...acc,
				[curr.env.name + '_' + currSecret.name]: false
			}), {})
	}, {}) : {};
</script>

{#if $Secrets.errors}
	{$Secrets.errors[0].message}
{:else}
	{#if $Secrets.fetching}
		<Loader></Loader>
	{:else}
		<div class="grid">
			{#each update as secrets}
				{@const env = secrets.env.name}
				<Card columns={12}>
					<div class="heading">
						<h3>{env}</h3>
						<Tooltip content="Create new secret in environment" arrow={false}>
							<Button
								class="add-secret"
								variant="tertiary"
								size="small"
								on:click={() => {
										createSecretOpen[env] =  true;
									}}
							>
								Create Secret
								<svelte:fragment slot="icon-left">
									<PlusIcon />
								</svelte:fragment>
							</Button>
						</Tooltip>
					</div>

					<CreateSecret
						refetch={() => Secrets.fetch({})}
						bind:open={createSecretOpen[env]}
						bind:team
						env={env}
					/>

					<Table size="small">
						<Thead>
						<Th style="width: 50px"></Th>
						<Th>Name</Th>
						</Thead>
						<Tbody>
						{#each secrets.secrets as secret}
							<TrExpander>
								<div slot="row-content">
									{secret.name}
									<Tooltip content="Delete secret from environment" arrow={false}>
										<Button
											class="delete-secret"
											variant="danger"
											size="small"
											on:click={() => {
												deleteSecretOpen[env + '_' + secret.name] = true;
											}}
										>
											Delete
										</Button>
									</Tooltip>
									<Confirm
										bind:open={deleteSecretOpen[env + '_' + secret.name]}
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
								<div slot="expander-content">
									<div>
										<div class="secrets-edit">
											{#each secret.data as data (data.key)}
												<SecretKv {env} secret={secret.name} key={data.key} value={data.value} bind:changes />
											{/each}
											{#each filterLocalAddKvs(env, secret.name, changes) as change (change.data.key)}
												<SecretKv {env} secret={change.data.secret} key={change.data.key} value={change.data.value}
																	bind:changes />
											{/each}
											<AddSecretKv {env} secret={secret.name} bind:changes existingKeys={secret.data.map((d) => d.key)}></AddSecretKv>
										</div>
										<div class="secrets-edit-buttons">
											{#if changes.filter((c) => c.data.env + c.data.secret === env + secret.name).length > 0}
												<Tooltip content="Save changes" arrow={false}>
													<Button
														variant="primary"
														size="small"
														on:click={ async () => {
														if (update) {
															// TODO:
															//  - adding a new KV and undoing should remove the KV from the list right away?
															let mutation = changes.reduce(mergeChanges, update);

															let data = mutation
																.filter((m) => m.env.name === env)[0].secrets
																.filter((s) => s.name === secret.name)[0].data;

															await updateSecret.mutate({
																name: secret.name,
																team: team,
																env: env,
																data: data,
															})

															changes = changes.filter((c) => c.data.env + c.data.secret !== env + secret.name);
														}
													}}
													>
														Save
													</Button>
												</Tooltip>
												<Tooltip content="Discard all changes" arrow={false}>
													<Button
														variant="secondary"
														size="small"
														on:click={() => {
														 changes = changes.filter((c) => c.data.env + c.data.secret !== env + secret.name);
														 Secrets.fetch();
													}}
													>
														Cancel
													</Button>
												</Tooltip>
											{/if}
										</div>
									</div>
									<div class="apps">
										{#if secret.apps.length}<h4>Applications using this secret</h4>
										{:else}
											<Alert size="small" variant="info">Secret is not in use by any applications.</Alert>
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
<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        column-gap: 1rem;
        row-gap: 1rem;
    }

    :global(.add-secret) {
        height: 2.5rem;
    }

    .heading {
        display: flex;
        justify-content: space-between;
    }

    .secrets-edit-buttons {
        margin: 16px 0 0 16px;
        padding: 32px 0;
    }

    .secrets-edit-buttons > :global(*) {
        margin-right: 8px;
    }

    div[slot="row-content"] {
        display: flex;
        justify-content: space-between;
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
