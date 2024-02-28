<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { graphql, type Secret$result, type VariableInput } from '$houdini';
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
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import AddSecretKv from './AddSecretKv.svelte';
	import SecretKv from './SecretKv.svelte';
	import { added, deleted, mergeChanges, type operation, updated } from './state-machinery';
	import {
		ArrowUndoIcon,
		FloppydiskIcon,
		PlusCircleFillIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';

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
	let addOpen = false;
	let deleteOpen = false;
	let discardOpen = false;

	const dirty = (changes: operation[]) => {
		if (!secret) {
			return false;
		}

		const mutated = changes.reduce(mergeChanges, secret.data);
		return mutated.length !== secret.data.length ||
			added(secret.data, changes).length > 0 ||
			deleted(secret.data, changes).length > 0 ||
			updated(secret.data, changes).length > 0;
	};

	const calculateChanges = (secret: Secret$result['team']['secret']) => {
		return changes.reduce(mergeChanges, secret.data).sort((a, b) => a.name.localeCompare(b.name));
	};

	const workloadManifest = (secretName: string) => `spec:
  envFrom:
    - secret: ${secretName}`;

	const discard = () => {
		saved = false;
		changes = [];
		Secret.fetch();
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
		if (!secret || !dirty(changes)) {
			return;
		}

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
		setTimeout(() => {
			saved = false;
		}, 3000);
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

	const openAddModal = () => {
		addOpen = true;
	};

	const openDeleteSecretModal = () => {
		deleteOpen = true;
	};

	const openDiscardModal = () => {
		if (!dirty(changes)) {
			return;
		}
		discardOpen = true;
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
			on:click={openDeleteSecretModal}
		>
			<svelte:fragment slot="icon-left"><TrashIcon /></svelte:fragment>Delete
		</Button>
	</div>
	<div class="alerts">
		{#if saved && !dirty(changes)}
			<Alert variant="success" size="small">All changes saved!</Alert>
		{/if}
		{#if !saved && dirty(changes)}
			<Alert variant="warning" size="small">You have unsaved changes.</Alert>
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
	<div class="grid">
		<Card columns={8} rows={3}>
			<div class="data-heading">
				<h4>
					Secret data
					<HelpText title="Secret data" placement="right">
						A secret contains a set of key-value pairs.
					</HelpText>
				</h4>
				<div class="secret-edit-buttons">
					<Button
						variant="tertiary"
						size="small"
						title="Discard all changes"
						on:click={openDiscardModal}
						disabled={!dirty(changes)}
					>
						<svelte:fragment slot="icon-left"><ArrowUndoIcon /></svelte:fragment>Reset
					</Button>
					<Button
						variant="primary"
						size="small"
						title="Persist all changes"
						on:click={updateSecret}
						loading={$updateSecretMutation.fetching}
						disabled={!dirty(changes)}
					>
						<svelte:fragment slot="icon-left"><FloppydiskIcon /></svelte:fragment>Save
					</Button>
				</div>
			</div>
			{#if secret.data.length === 0 && added(secret.data, changes).length === 0}
				<Alert variant="info" size="small">No data found. Add a new key to get started.</Alert>
			{:else}
				<Table size="small" style="margin-top: 2rem" zebraStripes={true}>
					<Thead>
						<Tr>
							<Th>Key</Th>
							<Th align="right">Actions</Th>
							<Th />
						</Tr>
					</Thead>
					<Tbody>
						{#each calculateChanges(secret) as data (data.name)}
							<SecretKv
								key={data.name}
								initialValue={data.value}
								bind:changes
								initial={secret.data}
							/>
						{/each}
					</Tbody>
				</Table>
			{/if}
			<div class="add-kv-buttons">
				<Button
					title="Add new key and value"
					variant="tertiary"
					size="small"
					on:click={openAddModal}
				>
					<svelte:fragment slot="icon-left">
						<PlusCircleFillIcon />
					</svelte:fragment>
					Add key and value
				</Button>
			</div>
			<AddSecretKv bind:changes bind:open={addOpen} initial={secret.data} />
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
		margin: 0 0 1rem 0;
		padding: 0 1rem 0 1rem;
	}

	.manifest {
		display: block;
		padding: 1rem 0;
		word-break: break-word;
		white-space: pre-wrap;
		margin: 0 1rem;
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

	.add-kv-buttons {
		margin-top: 2rem;
	}
</style>
