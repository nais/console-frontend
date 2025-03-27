<script lang="ts">
	import { goto } from '$app/navigation';
	import { type DeleteJobPage$result, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import PersistenceList from '$lib/components/persistence/PersistenceList.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Button, Heading, HelpText, TextField } from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { DeleteJobPage } = $derived(data);

	let result = $derived($DeleteJobPage.data);

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

	let deleteJobErrors = $derived($deleteJob.errors);
	let deleteJobFetching = $derived($deleteJob.fetching);

	let confirmation = $state('');

	const submit = async () => {
		const job = get(DeleteJobPage).data?.team.environment.job;
		if (!job) {
			return;
		}

		const resp = await deleteJob.mutate({
			job: job.name,
			env: job.teamEnvironment.environment.name,
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
			app.valkeyInstances.nodes.filter((s) => !s.terminationProtection).length > 0
		);
	}

	function hasOrphans(app: DeleteJobPage$result['team']['environment']['job']) {
		return (
			app.sqlInstances.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			app.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			app.buckets.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			app.valkeyInstances.nodes.filter((s) => s.terminationProtection).length > 0
		);
	}
</script>

{#if result?.team.environment.job}
	{@const job = result.team.environment.job}
	<Card borderColor="var(--a-border-danger)">
		{#if job.deletionStartedAt}
			<Heading level="2">Deletion in progress</Heading>
			This job is being deleted. Deletion started <Time time={job.deletionStartedAt} distance />. If
			the deletion is taking too long, contact the Nais team.
		{:else}
			{#if hasResourcesToDelete(job)}
				<p>
					In addition to the application the following resources
					<strong>will be permanently deleted</strong>:
				</p>
			{/if}
			<div>
				{#each job.sqlInstances.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceList persistence={node}>
						This will be deleted because <code>cascadingDelete</code>
						is set to
						<code>true</code>
						in the manifest.
					</PersistenceList>
				{/each}
				{#each job.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceList persistence={node}>
						This will be deleted because <code>cascadingDelete</code>
						is set to
						<code>true</code>
						in the manifest.
					</PersistenceList>
				{/each}
				{#each job.buckets.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceList persistence={node}
						>This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in
						the manifest.
					</PersistenceList>
				{/each}
				{#each job.redisInstances.nodes as node (node.id)}
					<PersistenceList persistence={node}
						>If this Redis instance is defined on team level, it won't be deleted. If it's created
						by the app, it will be permanently deleted.
					</PersistenceList>
				{/each}
				{#each job.valkeyInstances.nodes.filter((s) => !s.terminationProtection) as node (node.id)}
					<PersistenceList persistence={node}
						>If this Valkey instance is defined on team level, it won't be deleted. If it's created
						by the app, it will be permanently deleted.
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
						The resource may still exist after the app has been deleted and you will have to
						manually delete it.
					</HelpText>
				</div>
				<div>
					{#each job.sqlInstances.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
						<PersistenceList persistence={node} />
					{/each}
					{#each job.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
						<PersistenceList persistence={node} />
					{/each}
					{#each job.buckets.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
						<PersistenceList persistence={node} />
					{/each}
					{#each job.valkeyInstances.nodes.filter((s) => s.terminationProtection) as node (node.id)}
						<PersistenceList persistence={node} />
					{/each}
				</div>
			{/if}

			{@const expected = job.teamEnvironment.environment.name + '/' + job.name}
			<p>
				Confirm deletion by writing <strong>{expected}</strong> in the box below and click
				<em>Delete</em>.
			</p>
			{#if deleteJobErrors}
				<GraphErrors errors={deleteJobErrors} />
			{/if}

			<form
				onsubmit={(e: SubmitEvent) => {
					e.preventDefault();
					submit();
				}}
			>
				<TextField label="" hideLabel bind:value={confirmation} style="width: 300px;" />
				<Button disabled={confirmation !== expected} variant="danger" loading={deleteJobFetching}>
					Delete
				</Button>
			</form>
		{/if}
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
