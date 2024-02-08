<script lang="ts">
	import { page } from '$app/stores';
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
	import type { PageData } from './$houdini';
	import Card from '$lib/Card.svelte';
	import { graphql, type Secret$result } from '$houdini';
	import { filterAddKvs, mergeChanges, type operation, type updateState } from './state-machinery';
	import Confirm from '$lib/components/Confirm.svelte';
	import SecretKv from './SecretKv.svelte';
	import AddSecretKv from './AddSecretKv.svelte';
	import { goto } from '$app/navigation';
	import HumanTime from '$lib/HumanTime.svelte';

	export let data: PageData;
	$: ({ Secret } = data);

	$: secret = $page.params.secret;
	$: env = $page.params.env;
	$: team = $page.params.team;

	let changes: operation[] = [];
	let update: updateState = [];

	$: mkUpdate($Secret.data?.team.secret);
	let mkUpdate = (secret: Secret$result['team']['secret'] | undefined | null) => {
		if (!secret) {
			return;
		}

		update = JSON.parse(JSON.stringify(secret.data));
	};

	let discardChanges = () => {
		changes = [];
		Secret.fetch();
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
	let updateSecret = async () => {
		if (update) {
			let data = changes.reduce(mergeChanges, update);

			await updateSecretMutation.mutate({
				data: data,
				env: env,
				name: secret,
				team: team
			});

			changes = [];
			await Secret.fetch();
		}
	};

	let deleteSecretMutation = graphql(`
		mutation deleteSecret($name: String!, $team: Slug!, $env: String!) {
			deleteSecret(name: $name, team: $team, env: $env)
		}
	`);
	let deleteSecret = async () => {
		await deleteSecretMutation.mutate({
			name: secret,
			team: team,
			env: env
		});
		await goto('/team/' + team + '/secrets');
	};

	let deleteSecretOpen = false;
	let toggleDeleteSecretOpen = () => {
		deleteSecretOpen = !deleteSecretOpen;
	};

	$: applicationManifest = `spec:
  envFrom:
    - secret: ${secret}`;
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

{#if secret !== undefined}
	<h3>
		<a href="/team/{team}">{team}</a> /
		<a href="/team/{team}/secrets">secrets</a> /
		{env} /
		<i><a href="/team/{team}/{env}/secret/{secret}">{secret}</a></i>
	</h3>
{:else}
	<h3>
		<a href="/team/{team}">{team}</a> / <a href="/team/{team}/secrets">secrets</a> / {env}
	</h3>
{/if}

{#if $Secret.errors}
	<Alert variant="error">
		{#each $Secret.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $Secret.fetching}
	<Loader />
{:else if $Secret.data}
	{@const secret = $Secret.data.team.secret}
	<div class="grid">
		<Card columns={8} rows={3}>
			<div class="header">
				<h4>
					Secret Data
					<HelpText title="Secret data" placement="right">
						A secret contains a set of key-value pairs.<br />
						<br />
						Changes are not persisted until the "Confirm" button is clicked.<br />
						Applications using the secret will automatically restart to pick up any changes.
						<br />
					</HelpText>
				</h4>
				<Tooltip content="Delete secret from environment" arrow={false}>
					<Button
						class="delete-secret"
						variant="danger"
						size="small"
						on:click={toggleDeleteSecretOpen}
					>
						Delete
					</Button>
				</Tooltip>
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

					Are you sure you want to delete this secret?
				</Confirm>
			</div>
			<Table size="small" style="margin-top: 2rem">
				<Tbody>
					<div class="secret-content">
						<div class="secret-edit">
							{#each secret.data as data (data.name)}
								<SecretKv key={data.name} value={data.value} bind:changes />
							{/each}
							{#each filterAddKvs(changes) as change (change.data.name)}
								<SecretKv key={change.data.name} value={change.data.value} bind:changes />
							{/each}
							<AddSecretKv bind:changes existingKeys={secret.data.map((d) => d.name)} />
						</div>
						<div class="secret-edit-buttons">
							{#if changes.length > 0}
								<Tooltip content="Persist all changes" arrow={false}>
									<Button variant="primary" size="small" on:click={updateSecret}>Confirm</Button>
								</Tooltip>
								<Tooltip content="Discard all changes" arrow={false}>
									<Button variant="secondary" size="small" on:click={discardChanges}>Cancel</Button>
								</Tooltip>
							{/if}
						</div>
						{#if $updateSecretMutation.errors}
							<Alert variant="error">{$updateSecretMutation.errors[0]?.message}</Alert>
						{/if}
					</div>
				</Tbody>
			</Table>
		</Card>

		<Card columns={4} rows={1}>
			<h5>Last modified</h5>
			<div class="metadata-value">
				{#if secret.lastModifiedAt}
					<HumanTime time={secret.lastModifiedAt} distance />
				{:else}
					<code>n/a</code>
				{/if}
			</div>
			<h5>Last modified by</h5>
			<div class="metadata-value">
				{#if secret.lastModifiedBy}
					{secret.lastModifiedBy.name} ({secret.lastModifiedBy.email})
				{:else}
					<code>n/a</code>
				{/if}
			</div>
		</Card>

		<Card columns={4} rows={1}>
			<h4>
				Used by
				<HelpText title="List of applications using this secret" placement="bottom">
					A secret can be used by multiple applications.<br />
					<br />
					This section lists all applications that use this secret.
				</HelpText>
			</h4>
			{#if secret.apps.length > 0}
				<ul>
					{#each secret.apps as app}
						<li><a href="/team/{team}/{env}/app/{app.name}">{app.name}</a></li>
					{/each}
				</ul>
			{:else}
				<Alert size="small" variant="info">Secret is not in use by any applications.</Alert>
			{/if}
		</Card>

		<Card columns={4} rows={1}>
			<h4>
				Use secret in application
				<HelpText title="How to use this secret in an application" placement="bottom">
					To use this secret in your application, you will need to reference it in your
					application's manifest.<br />
					<br />
					The snippet below injects the secret into your application. Each key-value pair is then available
					as environment variables.
				</HelpText>
			</h4>
			<pre class="manifest">{applicationManifest}</pre>
			<Tooltip content="Copy manifest to clipboard">
				<CopyButton
					text="Copy manifest"
					activeText="Manifest copied"
					variant="action"
					copyText={applicationManifest}
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
		margin-top: 0.5rem;
		gap: 0.5rem;
	}

	ul {
		list-style: none;
		margin: 1rem 0 1rem 0;
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

	.secret-content {
		padding: 8px;
	}

	.secret-edit-buttons {
		margin: 16px 0 0 16px;
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
</style>
