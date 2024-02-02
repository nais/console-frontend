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
		Tr
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	import { graphql, type Secrets$result } from '$houdini';
	import { page } from '$app/stores';
	import Confirm from '$lib/components/Confirm.svelte';

	import CreateSecret from './CreateSecret.svelte';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';

	export let data: PageData;
	let team = $page.params.team;

	let update: {
		env: {
			name: string;
		};
		secrets: {
			name: string;
		}[];
	}[] = [];

	$: ({ Secrets } = data);
	$: mkUpdate($Secrets.data?.secrets);
	let mkUpdate = (secret: Secrets$result['secrets'] | undefined | null) => {
		if (!secret) {
			return;
		}

		update = JSON.parse(JSON.stringify(secret));
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
	let createSecretOpen = update
		? update.reduce(
				(acc: Record<string, boolean>, curr) => ({
					...acc,
					[curr.env.name]: false
				}),
				{}
		  )
		: {};
	let openCreateSecretModal = (env: string) => {
		createSecretOpen[env] = true;
	};

	let deleteSecretOpen = update
		? update.reduce((acc: Record<string, boolean>, curr) => {
				return curr.secrets.reduce(
					(acc: Record<string, boolean>, currSecret) => ({
						...acc,
						[curr.env.name + '_' + currSecret.name]: false
					}),
					{}
				);
		  }, {})
		: {};
	let deleteSecretModalKey = (env: string, secret: string) => env + '_' + secret;
	let openDeleteSecretModal = (env: string, secret: string) => {
		deleteSecretOpen[deleteSecretModalKey(env, secret)] = true;
	};
</script>

{#if $Secrets.errors}
	<Alert variant="error">
		{#each $Secrets.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $Secrets.fetching}
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
							variant="tertiary"
							size="small"
							on:click={() => openCreateSecretModal(env)}
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
					existingNames={secrets.secrets.map((s) => s.name)}
					bind:open={createSecretOpen[env]}
					bind:team
					{env}
				/>

				<Table size="small">
					<Thead>
						<Th>Name</Th>
					</Thead>
					<Tbody>
						{#each secrets.secrets as secret}
							<Tr>
								<div class="row-content">
									<span>
										<span><a href="/team/{team}/{env}/secret/{secret.name}">{secret.name}</a></span>
									</span>
									<Tooltip content="Delete secret from environment" arrow={false}>
										<Button
											class="delete-secret"
											variant="tertiary"
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
										on:confirm={async () => {
											await deleteSecret(secret.name, env);
										}}
									>
										<svelte:fragment slot="header">
											<Heading>Delete secret</Heading>
										</svelte:fragment>
										<p>
											This will permanently delete the secret named <b>{secret.name}</b> from
											<b>{env}</b>.
										</p>

										Are you sure you want to delete this secret?
									</Confirm>
								</div>
							</Tr>
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

	.heading {
		display: flex;
		justify-content: space-between;
	}

	.row-content {
		display: flex;
		justify-content: space-between;
		margin: 1rem;
	}
</style>
