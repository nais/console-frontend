<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { graphql, type VariableInput } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import {
		Alert,
		Button,
		CopyButton,
		Heading,
		HelpText,
		Loader,
		Table,
		Tbody,
		Tooltip
	} from '@nais/ds-svelte-community';
	import type { NavigationTarget } from '@sveltejs/kit';
	import type { PageData } from './$houdini';
	import AddSecretKv from './AddSecretKv.svelte';
	import SecretKv from './SecretKv.svelte';
	import { filterAddKvs, mergeChanges, type operation } from './state-machinery';

	let navigateTo: NavigationTarget | null;
	beforeNavigate(({ to, cancel }) => {
		if (changes.length > 0) {
			cancel();
			navigateTo = to;
			openDiscardChangesModal();
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
	let deleteSecretOpen = false;
	let discardChangesOpen = false;

	const workloadManifest = (secretName: string) => `spec:
  envFrom:
    - secret: ${secretName}`;

	const discardChanges = () => {
		saved = false;
		changes = [];
		Secret.fetch();
		if (navigateTo) {
			goto(navigateTo.url);
			navigateTo = null;
		}
	};

	const updateSecretMutation = graphql(`
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
		if (!secret || changes.length == 0) return;

		let data: VariableInput[] = changes.reduce(mergeChanges, secret.data);

		await updateSecretMutation.mutate({
			data: data,
			env: env,
			name: secretName,
			team: team
		});

		if ($updateSecretMutation.errors) {
			return;
		}

		changes = [];
		saved = true;
	};

	const deleteSecretMutation = graphql(`
		mutation deleteSecret($name: String!, $team: Slug!, $env: String!) {
			deleteSecret(name: $name, team: $team, env: $env)
		}
	`);

	const deleteSecret = async () => {
		await deleteSecretMutation.mutate({
			name: secretName,
			team: team,
			env: env
		});

		if ($deleteSecretMutation.errors) {
			return;
		}

		await goto('/team/' + team + '/secrets');
	};

	const openDeleteSecretModal = () => {
		deleteSecretOpen = true;
	};

	const openDiscardChangesModal = () => {
		saved = false;
		if (changes.length === 0) return;
		discardChangesOpen = true;
	};
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

<h3>
	<a href="/team/{team}">{team}</a> /
	<a href="/team/{team}/secrets">secrets</a> /
	{env} /
	<i><a href="/team/{team}/{env}/secret/{secretName}">{secretName}</a></i>
</h3>

{#if $Secret.errors}
	<Alert variant="error">
		{#each $Secret.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $Secret.fetching}
	<Loader />
{:else if secret}
	<div class="alerts">
		{#if saved && changes.length === 0}
			<Alert variant="success" size="small">Changes saved!</Alert>
		{/if}
		{#if $updateSecretMutation.errors}
			<Alert variant="error">
				{#each $updateSecretMutation.errors as error}
					{error.message}
				{/each}
			</Alert>
		{:else if $deleteSecretMutation.errors}
			<Alert variant="error">
				{#each $deleteSecretMutation.errors as error}
					{error.message}
				{/each}
			</Alert>
		{/if}
	</div>
	<Confirm
		confirmText="Delete"
		variant="danger"
		bind:open={deleteSecretOpen}
		on:confirm={deleteSecret}
	>
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
	<Confirm
		confirmText="Discard"
		variant="danger"
		bind:open={discardChangesOpen}
		on:confirm={discardChanges}
		on:cancel={() => {
			navigateTo = null;
		}}
	>
		<svelte:fragment slot="header">
			<Heading>Discard all changes</Heading>
		</svelte:fragment>
		<p>You have unsaved changes. The changes will be lost if you continue.</p>

		Are you sure you want to discard all changes?
	</Confirm>
	<div class="grid">
		<Card columns={8} rows={3}>
			<div class="header">
				<h4>
					Secret Data
					<HelpText title="Secret data" placement="right">
						A secret contains a set of key-value pairs.
					</HelpText>
				</h4>
				<Tooltip content="Delete secret from environment" arrow={false}>
					<Button
						class="delete-secret"
						variant="danger"
						size="small"
						on:click={openDeleteSecretModal}
					>
						Delete
					</Button>
				</Tooltip>
			</div>
			<Table size="small" style="margin-top: 2rem">
				<Tbody>
					<div class="secret-content">
						<div class="secret-edit">
							{#if secret.data.length === 0 && filterAddKvs(changes).length === 0}
								<Alert variant="info" size="small">
									No data found. Add a new row to get started.
								</Alert>
							{/if}
							{#each secret.data as data (data.name)}
								<SecretKv key={data.name} value={data.value} bind:changes />
							{/each}
							{#each filterAddKvs(changes) as change (change.data.name)}
								<SecretKv key={change.data.name} value={change.data.value} bind:changes />
							{/each}
							<AddSecretKv bind:changes existingKeys={secret.data.map((d) => d.name)} />
						</div>
						<div class="secret-edit-buttons">
							<Tooltip content="Discard all changes" arrow={false}>
								<Button variant="secondary" size="small" on:click={openDiscardChangesModal}>
									Cancel
								</Button>
							</Tooltip>
							<Tooltip content="Persist all changes" arrow={false}>
								<Button
									variant="primary"
									size="small"
									on:click={updateSecret}
									loading={$updateSecretMutation.fetching}
								>
									Save
								</Button>
							</Tooltip>
						</div>
					</div>
				</Tbody>
			</Table>
		</Card>

		<Card columns={4} rows={1}>
			<h4>Metadata</h4>
			<h5>Last modified</h5>
			<div class="metadata-value">
				{#if secret.lastModifiedAt}
					<Time time={secret.lastModifiedAt} distance />
				{:else}
					<code>n/a</code>
				{/if}
			</div>
			<h5>Last modified by</h5>
			<div class="metadata-value">
				{#if secret.lastModifiedBy}
					<span class="cap" title={secret.lastModifiedBy.email}>{secret.lastModifiedBy.name}</span>
				{:else}
					<code>n/a</code>
				{/if}
			</div>
		</Card>

		<Card columns={4} rows={1}>
			<h4>
				Used by
				<HelpText title="List of workloads using this secret" placement="bottom">
					A secret can be used by multiple workloads.<br />
					<br />
					This section lists all workloads that use this secret.
				</HelpText>
			</h4>
			{#if secret.apps.length > 0}
				<h5>Applications</h5>
				<ul>
					{#each secret.apps as app}
						<li><a href="/team/{team}/{env}/app/{app.name}">{app.name}</a></li>
					{/each}
				</ul>
			{/if}
			{#if secret.jobs.length > 0}
				<h5>Jobs</h5>
				<ul>
					{#each secret.jobs as job}
						<li><a href="/team/{team}/{env}/job/{job.name}">{job.name}</a></li>
					{/each}
				</ul>
			{/if}
			{#if secret.apps.length === 0 && secret.jobs.length === 0}
				<Alert size="small" variant="info">Secret is not in use by any workloads.</Alert>
			{/if}
		</Card>

		<Card columns={4} rows={1}>
			<h4>
				Use secret in workload
				<HelpText title="How to use this secret in a workload" placement="bottom">
					Reference the secret in your workload manifest with the snippet below.
				</HelpText>
			</h4>
			<pre class="manifest">{workloadManifest(secretName)}</pre>
			<Tooltip content="Copy manifest to clipboard">
				<CopyButton
					text="Copy manifest"
					activeText="Manifest copied"
					variant="action"
					copyText={workloadManifest(secretName)}
				></CopyButton>
			</Tooltip>
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

	h5 {
		margin-top: 1rem;
		gap: 0.5rem;
	}

	ul {
		list-style: none;
		margin: 0rem 0 1rem 0;
		padding: 0 1rem 0 1rem;
	}

	.manifest {
		display: block;
		padding: 1rem 0;
		word-break: break-word;
		white-space: pre-wrap;
		margin: 0 1rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.alerts {
		margin-bottom: 1rem;
	}

	.secret-content {
		padding: 8px;
	}

	.secret-edit-buttons {
		display: flex;
		margin: 32px 0 0 16px;
		padding: 32px 0;
	}

	.secret-edit-buttons > :global(*) {
		margin-right: 8px;
	}

	.metadata-value {
		margin-left: 1rem;
	}

	code {
		font-size: 1rem;
	}

	.cap {
		text-transform: capitalize;
	}
</style>
