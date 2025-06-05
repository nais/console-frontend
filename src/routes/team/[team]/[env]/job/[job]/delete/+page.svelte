<script lang="ts">
	import { goto } from '$app/navigation';
	import { type DeleteJobPage$result, graphql } from '$houdini';
	import PersistenceList from '$lib/components/persistence/PersistenceList.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Button, Heading, TextField } from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { DeleteJobPage } = $derived(data);

	let result = $derived($DeleteJobPage.data);

	const deleteJob = graphql(`
		mutation DeleteJob($team: Slug!, $env: String!, $job: String!) {
			deleteJob(input: { teamSlug: $team, environmentName: $env, name: $job }) {
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
			env: job.teamEnvironment.environment.name,
			team: job.team.slug
		});

		if (resp.data?.deleteJob.success) {
			goto(`/team/${job.team.slug}?deleted=job/${job.name}`);
		}
	};

	function hasResourcesToDelete(job: DeleteJobPage$result['team']['environment']['job']) {
		return (
			job.sqlInstances.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			job.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			job.buckets.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			job.valkeyInstances.nodes.filter((s) => !s.terminationProtection).length > 0
		);
	}

	function hasOrphans(job: DeleteJobPage$result['team']['environment']['job']) {
		return (
			job.sqlInstances.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			job.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			job.buckets.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			job.valkeyInstances.nodes.filter((s) => s.terminationProtection).length > 0
		);
	}
</script>

<Heading level="2"><WarningIcon class="heading-aligned-icon" /> Danger Zone</Heading>
<div class="danger-zone">
	{#if result?.team.environment.job}
		{@const job = result.team.environment.job}
		{#if job.deletionStartedAt}
			<div class="heading-wrapper">
				<Heading level="3">Deletion in Progress</Heading>
			</div>
			<BodyShort
				>This job is being deleted. Deletion started <Time time={job.deletionStartedAt} distance />.
				If the deletion is taking too long, contact the Nais team.</BodyShort
			>
		{:else}
			<div class="heading-wrapper">
				<Heading level="3" spacing>Delete Job {job.name}</Heading>
			</div>

			{#if hasResourcesToDelete(job)}
				<BodyShort>
					In addition to the application the following resources
					<strong>will be permanently deleted</strong>:
				</BodyShort>
			{/if}

			<div>
				{#each job.sqlInstances.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceList persistence={node}>
						This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in
						the manifest.
					</PersistenceList>
				{/each}
				{#each job.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceList persistence={node}>
						This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in
						the manifest.
					</PersistenceList>
				{/each}
				{#each job.buckets.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceList persistence={node}
						>This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in
						the manifest.
					</PersistenceList>
				{/each}
				{#each job.valkeyInstances.nodes.filter((s) => !s.terminationProtection) as node (node.id)}
					<PersistenceList persistence={node}
						>If this Valkey instance is defined at the team level, it won't be deleted. If it was
						created by the application, it will be permanently deleted.
					</PersistenceList>
				{/each}
			</div>

			{#if hasOrphans(job)}
				<BodyShort>
					In addition to deleting the job, the following resources may be orphaned. These resources
					may still exist after the app is deleted and will need to be manually removed:
				</BodyShort>
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
			<div class="confirmation-wrapper">
				<BodyShort spacing>
					Confirm deletion by writing <strong>{expected}</strong> in the box below and click
					<em>Delete</em>.
				</BodyShort>
				{#if $deleteJob.errors}
					<GraphErrors errors={$deleteJob.errors} />
				{/if}

				<form
					onsubmit={(e: SubmitEvent) => {
						e.preventDefault();
						submit();
					}}
				>
					<TextField label="" hideLabel bind:value={confirmation} style="width: 300px;" />
					<Button
						disabled={confirmation !== expected}
						variant="danger"
						loading={$DeleteJobPage.fetching}
					>
						Delete
					</Button>
				</form>
			</div>
		{/if}
	{/if}
</div>

<style>
	code {
		font-size: 1rem;
	}

	form {
		display: flex;
		gap: 1rem;
	}

	.heading-wrapper {
		display: flex;
		gap: var(--ax-space-12);
		align-items: baseline;
	}

	.confirmation-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		margin-top: var(--ax-space-16);
	}
	.danger-zone {
		padding: var(--ax-space-16);
		border-radius: 8px;
		border: 1px solid var(--ax-border-danger);
	}
</style>
