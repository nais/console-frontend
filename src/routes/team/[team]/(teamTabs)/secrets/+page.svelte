<script lang="ts">
	/**
	 * TODO:
	 * - Refactor data model - we don't need to deepcopy(??????)
	 * - Push fetching down to the leaves;
	 *    - Initial fetch should only list envs and secret names per env (no data)
	 *    - Data is fetched per secret when the expander is opened etc
	 *    	Separate Queries for AddKv, DeleteKv etc. operations per component. This would simplify things, probably
	 */

	import Card from '$lib/Card.svelte';
	import {
		Table,
		Thead,
		Tbody,
		Th,
		Button,
		Heading,
		Alert,
		Loader,
		Tooltip,
		CopyButton
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	import { graphql, type Secrets$result } from '$houdini';
	import { page } from '$app/stores';
	import Confirm from '$lib/components/Confirm.svelte';

	import CreateSecret from './CreateSecret.svelte';
	import AddSecretKv from './AddSecretKv.svelte';
	import SecretKv from './SecretKv.svelte';
	import TrExpander from './TrExpander.svelte';
	import { filterAddKvs, mergeChanges, type operation, type updateState } from './state-machinery';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';

	export let data: PageData;
	let team = $page.params.team;

	let update: updateState = [];
	let changes: operation[];
	$: changes = [];

	$: ({ Secrets } = data);
	$: mkUpdate($Secrets.data?.secrets);
	let mkUpdate = (secret: Secrets$result['secrets'] | undefined | null) => {
		if (!secret) {
			return;
		}

		update = JSON.parse(JSON.stringify(secret));
	};

	$: hasChanges = (name: string, env: string) => {
		return changes.filter((c) => c.data.env + c.data.secret === env + name).length > 0;
	};
	let discardChanges = (name: string, env: string) => {
		changes = changes.filter((c) => c.data.env + c.data.secret !== env + name);
		Secrets.fetch();
	};

	$: updateSecretMutation = graphql(`
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
	let updateSecret = async (name: string, env: string) => {
		if (update) {
			let mutation = changes.reduce(mergeChanges, update);

			let data = mutation
				.filter((m) => m.env.name === env)[0].secrets
				.filter((s) => s.name === name)[0].data;

			await updateSecretMutation.mutate({
				name: name,
				team: team,
				env: env,
				data: data
			});

			changes = changes.filter((c) => c.data.env + c.data.secret !== env + name);
		}
	};

	let deleteSecretMutation = graphql(`
		mutation deleteSecret($name: String!, $team: Slug!, $env: String!) {
			deleteSecret(name: $name, team: $team, env: $env)
		}
	`);
	let deleteSecret = async (name: string, env: string) => {
		await deleteSecretMutation.mutate({
			name: name,
			team: team,
			env: env
		});
		await Secrets.fetch();
	};

	// (obj: Record<string, any>) => obj[key];
	let createSecretOpen = (update) ? update.reduce((acc: Record<string, boolean>, curr) => ({
		...acc,
		[curr.env.name]: false
	}), {}) : {};
	let openCreateSecretModal = (env: string) => {
		createSecretOpen[env] = true;
	};

	let deleteSecretOpen = (update) ? update.reduce((acc: Record<string, boolean>, curr) => {
		return curr.secrets.reduce(
			(acc: Record<string, boolean>, currSecret) => ({
				...acc,
				[curr.env.name + '_' + currSecret.name]: false
			}), {});
	}, {}) : {};
	let deleteSecretModalKey = (env: string, secret: string) => env + '_' + secret;
	let openDeleteSecretModal = (env: string, secret: string) => {
		deleteSecretOpen[deleteSecretModalKey(env, secret)] = true;
	};
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
							<Button class="add-secret" variant="tertiary" size="small" on:click={() => openCreateSecretModal(env)}>
								Create Secret
								<svelte:fragment slot="icon-left">
									<PlusIcon />
								</svelte:fragment>
							</Button>
						</Tooltip>
					</div>

					<CreateSecret
						refetch={() => Secrets.fetch({})}
						existingNames={secrets.secrets.map((s) => s.name)}
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
									<span>
										<span>{secret.name}</span>
										<!-- TODO: This needs more explanation for end users - What does this do? Why do I need it? -->
										<Tooltip content="Copy yaml to clipboard">
											<CopyButton copyText={`spec:
  envFrom:
    - secret: ${secret.name}`
    }></CopyButton>
										</Tooltip>
									</span>
									<Tooltip content="Delete secret from environment" arrow={false}>
										<Button
											class="delete-secret"
											variant="danger"
											size="small"
											on:click={() => openDeleteSecretModal(env, secret.name)}
										>
											Delete
										</Button>
									</Tooltip>
									<Confirm
										confirmText="Delete"
										variant="danger"
										bind:open={deleteSecretOpen[deleteSecretModalKey(env, secret.name)]}
										on:confirm={async () => {await deleteSecret(secret.name, env)}}
									>
										<svelte:fragment slot="header">
											<Heading>Delete secret</Heading>
										</svelte:fragment>
										<p>
											This will permanently delete the secret named <b>{secret.name}</b> from <b>{env}</b>.
										</p>

										Are you sure you want to delete this secret?
									</Confirm>
								</div>
								<div slot="expander-content">
									<div>
										<div class="secrets-edit">
											{#each secret.data as data (data.key)}
												<SecretKv
													{env}
													secret={secret.name}
													key={data.key}
													value={data.value}
													bind:changes
												/>
											{/each}
											{#each filterAddKvs(env, secret.name, changes) as change (change.data.key)}
												<SecretKv
													{env}
													secret={change.data.secret}
													key={change.data.key}
													value={change.data.value}
													bind:changes
												/>
											{/each}
											<AddSecretKv
												{env}
												secret={secret.name}
												bind:changes
												existingKeys={secret.data.map((d) => d.key)}
											/>
										</div>
										<div class="secrets-edit-buttons">
											{#if hasChanges(secret.name, env)}
												<Tooltip content="Persist all changes" arrow={false}>
													<Button
														variant="primary"
														size="small"
														on:click={async () => await updateSecret(secret.name, env)}
													>
														Confirm
													</Button>
												</Tooltip>
												<Tooltip content="Discard all changes" arrow={false}>
													<Button variant="secondary" size="small" on:click={() => discardChanges(secret.name, env)}>
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
									{#if $updateSecretMutation.errors}
										<Alert variant="error">{$updateSecretMutation.errors[0]?.message}</Alert>
									{/if}
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

    div[slot="row-content"] > span {
        display: flex;
    }

    div[slot="row-content"] > span > span {
        align-self: center;
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
