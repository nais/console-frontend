<script lang="ts">
	import { goto } from '$app/navigation';
	import { graphql, type DeleteJobPage$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Alert, Button, HelpText, TextField } from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';
	import StorageList from '$lib/components/StorageList.svelte';

	export let data: PageData;

	$: ({ DeleteJobPage } = data);

	const isPermanentDeletion = (s: DeleteJobPage$result['naisjob']['storage'][0]) => {
		switch (s.__typename) {
			case 'BigQueryDataset':
				return s.cascadingDelete;
			case 'Bucket':
				return s.cascadingDelete;
			case 'SqlInstance':
				return s.cascadingDelete;
			default:
				if (s.type === 'Redis') {
					// We can't know if it's permanent deletion or not, so we assume it is
					return true;
				}
				return false;
		}
	};

	const deleteJob = graphql(`
		mutation DeleteJob($team: Slug!, $env: String!, $job: String!) {
			deleteJob(team: $team, env: $env, name: $job) {
				deleted
				error
			}
		}
	`);

	const permanentDeletion = (storage: DeleteJobPage$result['naisjob']['storage']) => {
		return storage.filter((s) => isPermanentDeletion(s));
	};
	const notPermanentDeletion = (storage: DeleteJobPage$result['naisjob']['storage']) => {
		return storage.filter((s) => !isPermanentDeletion(s));
	};

	let confirmation = '';

	const submit = async () => {
		const job = get(DeleteJobPage).data?.naisjob;
		if (!job) {
			return;
		}

		const resp = await deleteJob.mutate({
			job: job.name,
			env: job.env.name,
			team: job.team.slug
		});

		if (resp.data?.deleteJob.deleted) {
			goto(`/team/${job.team.slug}?deleted=job/${job.name}`);
		}
	};
</script>

{#if $DeleteJobPage?.data?.naisjob}
	{@const naisjob = $DeleteJobPage?.data?.naisjob}
	{@const perm = permanentDeletion(naisjob.storage)}
	{@const notPerm = notPermanentDeletion(naisjob.storage)}
	<Card borderColor="var(--a-border-danger)">
		<h3>Delete {naisjob.name}</h3>

		{#if perm.length > 0}
			<p>
				In addition to the application the following resources
				<strong>will be permanently deleted</strong>:
			</p>
			<div>
				{#each perm as storage}
					<StorageList {storage}>
						{#if storage.type == 'Redis'}
							If this Redis instance is defined on team level, it won't be deleted. If it's created
							by the app, it will be permanently deleted.
						{:else}
							This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in
							the manifest.
						{/if}
					</StorageList>
				{/each}
			</div>
		{/if}

		{#if notPerm.length > 0}
			<br />
			<div>
				In addition to the application the following resources <strong>may be orphaned</strong>:
				<HelpText title="Why orphaned?">
					The resource may still exist after the app has been deleted and you will have to manually
					delete it.
				</HelpText>
			</div>
			<div>
				{#each notPerm as storage}
					<StorageList {storage}></StorageList>
				{/each}
			</div>
		{/if}

		{@const expected = naisjob.env.name + '/' + naisjob.name}
		<p>
			Confirm deletion by writing <strong>{expected}</strong> in the box below and click
			<em>Delete</em>
		</p>
		{#if $deleteJob.errors}
			<GraphErrors errors={$deleteJob.errors} />
		{/if}
		{#if $deleteJob.data?.deleteJob.error}
			<Alert variant="error">
				Error occured while deleting app:<br />
				{$deleteJob.data.deleteJob.error}
			</Alert>
		{/if}
		<form on:submit|preventDefault={submit}>
			<TextField hideLabel bind:value={confirmation} style="width: 300px;" />
			<Button disabled={confirmation !== expected} variant="danger" loading={$deleteJob.fetching}>
				Delete
			</Button>
		</form>
	</Card>
{/if}

<style>
	code {
		font-size: 1rem;
	}

	form {
		display: flex;
		gap: 1rem;
	}

	div > :global(.navds-help-text) {
		display: inline-block;
	}
</style>
