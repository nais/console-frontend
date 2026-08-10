<script lang="ts">
	import { type DeleteJobPage$result } from '$houdini';
	import PersistenceItem from '$lib/domain/persistence/PersistenceItem.svelte';
	import { deleteConfirmationForm } from '$lib/forms/delete-confirmation';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Form from '$lib/ui/Form/Form.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Button, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let { DeleteJobPage } = $derived(data);

	let result = $derived($DeleteJobPage.data);

	function hasResourcesToDelete(job: DeleteJobPage$result['team']['environment']['job']) {
		return (
			job.sqlInstances.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			job.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			job.buckets.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			job.valkeys.nodes.filter((s) => !s.terminationProtection).length > 0
		);
	}

	function hasOrphans(job: DeleteJobPage$result['team']['environment']['job']) {
		return (
			job.sqlInstances.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			job.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			job.buckets.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			job.valkeys.nodes.filter((s) => s.terminationProtection).length > 0
		);
	}
</script>

<Heading as="h2"><WarningIcon class="heading-aligned-icon" /> Danger Zone</Heading>
<div class="danger-zone">
	{#if result?.team.environment.job}
		{@const job = result.team.environment.job}
		{#if job.deletionStartedAt}
			<div class="heading-wrapper">
				<Heading as="h3">Deletion in Progress</Heading>
			</div>
			<BodyShort
				>This job is being deleted. Deletion started <Time time={job.deletionStartedAt} distance />.
				If the deletion is taking too long, contact the Nais team.</BodyShort
			>
		{:else}
			<div class="heading-wrapper">
				<Heading as="h3" spacing>Delete Job {job.name}</Heading>
			</div>

			{#if hasResourcesToDelete(job)}
				<BodyShort>
					In addition to the application the following resources
					<strong>will be permanently deleted</strong>:
				</BodyShort>
			{/if}

			<div>
				{#each job.sqlInstances.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceItem persistence={node}>
						This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in the
						manifest.
					</PersistenceItem>
				{/each}
				{#each job.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceItem persistence={node}>
						This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in the
						manifest.
					</PersistenceItem>
				{/each}
				{#each job.buckets.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceItem persistence={node}
						>This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in
						the manifest.
					</PersistenceItem>
				{/each}
				{#each job.valkeys.nodes.filter((s) => !s.terminationProtection) as node (node.id)}
					<PersistenceItem persistence={node}
						>If this Valkey instance is defined at the team level, it won't be deleted. If it was
						created by the application, it will be permanently deleted.
					</PersistenceItem>
				{/each}
			</div>

			{#if hasOrphans(job)}
				<BodyShort>
					In addition to deleting the job, the following resources may be orphaned. These resources
					may still exist after the app is deleted and will need to be manually removed:
				</BodyShort>
				<div>
					{#each job.sqlInstances.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
						<PersistenceItem persistence={node} />
					{/each}
					{#each job.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
						<PersistenceItem persistence={node} />
					{/each}
					{#each job.buckets.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
						<PersistenceItem persistence={node} />
					{/each}
					{#each job.valkeys.nodes.filter((s) => s.terminationProtection) as node (node.id)}
						<PersistenceItem persistence={node} />
					{/each}
				</div>
			{/if}
			{@const expected = job.teamEnvironment.environment.name + '/' + job.name}
			<div class="confirmation-wrapper">
				<Form fields={deleteConfirmationForm(expected)} {form}>
					{#snippet button({ submitting })}
						<Button type="submit" variant="danger" loading={submitting}>Delete</Button>
					{/snippet}
				</Form>
			</div>
		{/if}
	{/if}
</div>

<style>
	code {
		font-size: 1rem;
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
		border-radius: var(--ax-radius-8);
		border: 1px solid var(--ax-border-danger);
	}
</style>
