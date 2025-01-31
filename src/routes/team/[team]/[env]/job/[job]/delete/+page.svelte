<script lang="ts">
	import { goto } from '$app/navigation';
	import { type DeleteJobPage$result, graphql } from '$houdini';
	import PersistenceList from '$lib/components/PersistenceList.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Alert, Button, HelpText, TextField } from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { DeleteJobPage } = $derived(data);

	const deleteJob = graphql(`
		mutation DeleteJob($team: Slug!, $env: String!, $job: String!) {
			deleteJob(input: { teamSlug: $team, environmentName: $env, name: $job }) {
				team {
					slug
				}
				success
			}
		}
	`);

	let confirmation = $state('');

	const submit = async () => {
		const job = get(DeleteJobPage).data?.team.environment.job;
		if (!job) {
			return;
		}

		const resp = await deleteJob.mutate({
			job: job.name,
			env: job.environment.name,
			team: job.team.slug
		});

		if (resp.data?.deleteJob.success) {
			goto(`/team/${job.team.slug}?deleted=job/${job.name}`);
		}
	};

	function hasResourcesToDelete(app: DeleteJobPage$result['team']['environment']['job']) {
		return (
			app.sqlInstances.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			app.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			app.buckets.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			app.redisInstances.nodes.length > 0 ||
			app.valkeyInstances.nodes.length > 0
		);
	}

	function hasOrphans(app: DeleteJobPage$result['team']['environment']['job']) {
		return (
			app.sqlInstances.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			app.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			app.buckets.nodes.filter((s) => !s.cascadingDelete).length > 0
		);
	}
</script>

{#if $DeleteJobPage?.data?.team.environment.job}
	{@const job = $DeleteJobPage?.data?.team.environment.job}
	<h3>Delete {job.name}</h3>

	{#if hasResourcesToDelete(job)}
		<p>
			In addition to the application the following resources
			<strong>will be permanently deleted</strong>:
		</p>
	{/if}
	<div>
		{#each job.sqlInstances.nodes.filter((s) => s.cascadingDelete) as node}
			<PersistenceList persistence={node}>
				This will be deleted because <code>cascadingDelete</code>
				is set to
				<code>true</code>
				in the manifest.
			</PersistenceList>
		{/each}
		{#each job.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete) as node}
			<PersistenceList persistence={node}>
				This will be deleted because <code>cascadingDelete</code>
				is set to
				<code>true</code>
				in the manifest.
			</PersistenceList>
		{/each}
		{#each job.buckets.nodes.filter((s) => s.cascadingDelete) as node}
			<PersistenceList persistence={node}
				>This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in the
				manifest.
			</PersistenceList>
		{/each}
		{#each job.redisInstances.nodes as node}
			<PersistenceList persistence={node}
				>If this Redis instance is defined on team level, it won't be deleted. If it's created by
				the app, it will be permanently deleted.
			</PersistenceList>
		{/each}
		{#each job.valkeyInstances.nodes as node}
			<PersistenceList persistence={node}
				>If this Valkey instance is defined on team level, it won't be deleted. If it's created by
				the app, it will be permanently deleted.
			</PersistenceList>
		{/each}
	</div>

	{#if hasOrphans(job)}
		<br />
		<div>
			In addition to deleting the application the following resources <strong
				>may be orphaned</strong
			>:
			<HelpText title="Why orphaned?">
				The resource may still exist after the app has been deleted and you will have to manually
				delete it.
			</HelpText>
		</div>
		<div>
			{#each job.sqlInstances.nodes.filter((s) => !s.cascadingDelete) as node}
				<PersistenceList persistence={node} />
			{/each}
			{#each job.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete) as node}
				<PersistenceList persistence={node} />
			{/each}
			{#each job.buckets.nodes.filter((s) => !s.cascadingDelete) as node}
				<PersistenceList persistence={node} />
			{/each}
		</div>
	{/if}

	{@const expected = job.environment.name + '/' + job.name}
	<p>
		Confirm deletion by writing <strong>{expected}</strong> in the box below and click
		<em>Delete</em>
	</p>
	{#if $deleteJob.errors}
		<GraphErrors errors={$deleteJob.errors} />
	{/if}
	{#if $deleteJob.errors}
		<Alert variant="error">
			Error occured while deleting app:<br />
			{#each $deleteJob.errors as error}
				{error.message}<br />
			{/each}
		</Alert>
	{/if}
	<form
		onsubmit={(e: SubmitEvent) => {
			e.preventDefault();
			submit();
		}}
	>
		<TextField label="" hideLabel bind:value={confirmation} style="width: 300px;" />
		<Button disabled={confirmation !== expected} variant="danger" loading={$deleteJob.fetching}>
			Delete
		</Button>
	</form>
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
