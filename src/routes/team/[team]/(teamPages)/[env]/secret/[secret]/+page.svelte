<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { graphql, type VariableInput } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import { Alert, Button, Heading, HelpText, Loader } from '@nais/ds-svelte-community';
	import { ArrowUndoIcon, FloppydiskIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import AddKeyValue from './AddKeyValue.svelte';
	import Data from './Data.svelte';
	import Manifest from './Manifest.svelte';
	import Metadata from './Metadata.svelte';
	import Workloads from './Workloads.svelte';
	import { added, deleted, mergeChanges, updated, type operation } from './state-machinery';

	beforeNavigate(({ cancel }) => {
		if (dirty(changes)) {
			if (!confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
				cancel();
			}
		}
	});

	export let data: PageData;

	$: ({ Secret } = data);
	$: secret = $Secret.data?.team.secret;

	$: secretName = $page.params.secret;
	$: env = $page.params.env;
	$: team = $page.params.team;

	let changes: operation[] = [];
	let saved = false;
	let deleteOpen = false;
	let discardOpen = false;

	const dirty = (changes: operation[]) => {
		if (!secret) {
			return false;
		}

		const mutated = changes.reduce(mergeChanges, secret.data);
		return (
			mutated.length !== secret.data.length ||
			added(secret.data, changes).length > 0 ||
			deleted(secret.data, changes).length > 0 ||
			updated(secret.data, changes).length > 0
		);
	};

	const discard = () => {
		saved = false;
		changes = [];
		Secret.fetch();
	};

	const updateMutation = graphql(`
		mutation updateSecret($name: String!, $team: Slug!, $env: String!, $data: [VariableInput!]!) {
			updateSecret(name: $name, team: $team, env: $env, data: $data) {
				id
				data {
					name
					value
				}
				lastModifiedBy {
					name
					email
				}
				lastModifiedAt
			}
		}
	`);
	const updateSecret = async () => {
		saved = false;
		if (!secret || !dirty(changes)) {
			return;
		}

		let data: VariableInput[] = changes.reduce(mergeChanges, secret.data);

		await updateMutation.mutate({
			data: data,
			env: env,
			name: secretName,
			team: team
		});

		if ($updateMutation.errors) {
			return;
		}

		changes = [];
		saved = true;
		setTimeout(() => {
			saved = false;
		}, 3000);
	};

	const deleteMutation = graphql(`
		mutation deleteSecret($name: String!, $team: Slug!, $env: String!) {
			deleteSecret(name: $name, team: $team, env: $env)
		}
	`);

	const deleteSecret = async () => {
		await deleteMutation.mutate({
			name: secretName,
			team: team,
			env: env
		});

		if ($deleteMutation.errors) {
			return;
		}

		await goto('/team/' + team + '/secrets');
	};

	const openDeleteModal = () => {
		deleteOpen = true;
	};

	const openDiscardModal = () => {
		if (!dirty(changes)) {
			return;
		}
		discardOpen = true;
	};
</script>

{#if $Secret.errors}
	<Alert variant="error">
		{#each $Secret.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $Secret.fetching}
	<Loader />
{:else if secret}
	<Confirm confirmText="Delete" variant="danger" bind:open={deleteOpen} on:confirm={deleteSecret}>
		<svelte:fragment slot="header">
			<Heading>Delete secret</Heading>
		</svelte:fragment>
		<p>
			This will permanently delete the secret named <b>{secret.name}</b> from <b>{env}</b>.
		</p>
		{#if secret.apps.length > 0 || secret.jobs.length > 0}
			<p>These workloads still reference the secret:</p>
			<ul>
				{#each secret.apps as app}
					<li><a href="/team/{team}/{env}/app/{app.name}">{app.name}</a></li>
				{/each}
				{#each secret.jobs as job}
					<li><a href="/team/{team}/{env}/job/{job.name}">{job.name}</a></li>
				{/each}
			</ul>
			<br />
		{/if}

		Are you sure you want to delete this secret?
	</Confirm>

	<Confirm confirmText="Discard" variant="danger" bind:open={discardOpen} on:confirm={discard}>
		<svelte:fragment slot="header">
			<Heading>Discard all changes</Heading>
		</svelte:fragment>
		<p>All unsaved changes will be lost if you continue.</p>

		Are you sure you want to discard all changes?
	</Confirm>

	<div class="heading">
		<span />
		<Button
			class="delete-secret"
			title="Delete secret from environment"
			variant="danger"
			size="small"
			on:click={openDeleteModal}
		>
			<svelte:fragment slot="icon-left">
				<TrashIcon />
			</svelte:fragment>
			Delete
		</Button>
	</div>
	<div class="alerts">
		{#if saved && !dirty(changes)}
			<Alert variant="success" size="small">All changes saved!</Alert>
		{/if}
		{#if !saved && dirty(changes)}
			<Alert variant="warning" size="small">You have unsaved changes.</Alert>
		{/if}
		{#if $updateMutation.errors}
			<Alert variant="error">
				{#each $updateMutation.errors as error}
					{error.message}
				{/each}
			</Alert>
		{:else if $deleteMutation.errors}
			<Alert variant="error">
				{#each $deleteMutation.errors as error}
					{error.message}
				{/each}
			</Alert>
		{/if}
	</div>
	<div class="grid">
		<Card columns={8} rows={3}>
			<div class="data-heading">
				<h4>
					Secret data
					<HelpText title="Secret data" placement="right">
						A secret contains a set of key-value pairs.
					</HelpText>
				</h4>
				<div class="edit">
					<Button
						variant="tertiary"
						size="small"
						title="Discard all changes"
						on:click={openDiscardModal}
						disabled={!dirty(changes)}
					>
						<svelte:fragment slot="icon-left">
							<ArrowUndoIcon />
						</svelte:fragment>
						Reset
					</Button>
					<Button
						variant="primary"
						size="small"
						title="Persist all changes"
						on:click={updateSecret}
						loading={$updateMutation.fetching}
						disabled={!dirty(changes)}
					>
						<svelte:fragment slot="icon-left">
							<FloppydiskIcon />
						</svelte:fragment>
						Save
					</Button>
				</div>
			</div>
			<Data bind:changes initial={secret.data} />
			<AddKeyValue bind:changes initial={secret.data} />
		</Card>
		<Card columns={4} rows={1}>
			<Metadata lastModifiedAt={secret.lastModifiedAt} lastModifiedBy={secret.lastModifiedBy} />
		</Card>
		<Card columns={4} rows={1}>
			<Workloads apps={secret.apps} jobs={secret.jobs} />
		</Card>
		<Card columns={4} rows={1}>
			<Manifest {secretName} />
		</Card>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	h4 {
		display: flex;
		font-weight: 400;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	ul {
		list-style: none;
		margin: 0 0 1rem 0;
		padding: 0 1rem 0 1rem;
	}

	.heading {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.alerts {
		margin-bottom: 1rem;
	}

	.data-heading {
		display: flex;
		justify-content: space-between;
		margin: 1rem 0;
	}

	.edit > :global(*) {
		margin-right: 8px;
	}
</style>
