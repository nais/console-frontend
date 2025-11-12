<script lang="ts">
	import { goto } from '$app/navigation';
	import { type DeleteAppPage$result, graphql } from '$houdini';
	import PersistenceItem from '$lib/domain/persistence/PersistenceItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Button, Heading, TextField } from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import { getTeamContext } from '../../../../teamContext.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { DeleteAppPage } = $derived(data);

	let result = $derived($DeleteAppPage.data);

	const deleteApp = graphql(`
		mutation DeleteApp($team: Slug!, $env: String!, $app: String!) {
			deleteApplication(input: { teamSlug: $team, environmentName: $env, name: $app }) {
				success
			}
		}
	`);

	const teamCtx = getTeamContext();
	let confirmation = $state('');

	const submit = async () => {
		const app = get(DeleteAppPage).data?.team.environment.application;
		if (!app) {
			return;
		}

		const resp = await deleteApp.mutate({
			app: app.name,
			env: app.teamEnvironment.environment.name,
			team: app.team.slug
		});

		if (resp.data?.deleteApplication.success) {
			teamCtx.refetchInventory();
			goto(`/team/${app.team.slug}?deleted=app/${app.name}`);
		}
	};

	function hasResourcesToDelete(app: DeleteAppPage$result['team']['environment']['application']) {
		return (
			app.sqlInstances.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			app.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			app.buckets.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			app.valkeys.nodes.filter((s) => !s.terminationProtection).length > 0
		);
	}

	function hasOrphans(app: DeleteAppPage$result['team']['environment']['application']) {
		return (
			app.sqlInstances.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			app.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			app.buckets.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			app.valkeys.nodes.filter((s) => s.terminationProtection).length > 0
		);
	}
</script>

<Heading level="2"><WarningIcon class="heading-aligned-icon" /> Danger Zone</Heading>
<div class="danger-zone">
	{#if result?.team.environment.application}
		{@const app = result.team.environment.application}
		{#if app.deletionStartedAt}
			<div class="heading-wrapper">
				<Heading level="3" spacing>Deletion in Progress</Heading>
			</div>
			<BodyShort
				>This application is being deleted. Deletion started <Time
					time={app.deletionStartedAt}
					distance
				/>. If the deletion is taking too long, contact the Nais team.</BodyShort
			>
		{:else}
			<div class="heading-wrapper">
				<Heading level="3" spacing>Delete Application {app.name}</Heading>
			</div>

			{#if hasResourcesToDelete(app)}
				<BodyShort>
					In addition to the application the following resources
					<strong>will be permanently deleted</strong>:
				</BodyShort>
			{/if}

			<div>
				{#each app.sqlInstances.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceItem persistence={node}>
						This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in
						the manifest.
					</PersistenceItem>
				{/each}
				{#each app.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceItem persistence={node}>
						This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in
						the manifest.
					</PersistenceItem>
				{/each}
				{#each app.buckets.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
					<PersistenceItem persistence={node}
						>This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in
						the manifest.
					</PersistenceItem>
				{/each}
				{#each app.valkeys.nodes.filter((s) => !s.terminationProtection) as node (node.id)}
					<PersistenceItem persistence={node}>
						If this Valkey instance is defined at the team level, it won't be deleted. If it was
						created by the application, it will be permanently deleted.
					</PersistenceItem>
				{/each}
			</div>

			{#if hasOrphans(app)}
				<BodyShort>
					In addition to deleting the application, the following resources may be orphaned. These
					resources may still exist after the app is deleted and will need to be manually removed:
				</BodyShort>
				<div>
					{#each app.sqlInstances.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
						<PersistenceItem persistence={node} />
					{/each}
					{#each app.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
						<PersistenceItem persistence={node} />
					{/each}
					{#each app.buckets.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
						<PersistenceItem persistence={node} />
					{/each}
					{#each app.valkeys.nodes.filter((s) => s.terminationProtection) as node (node.id)}
						<PersistenceItem persistence={node} />
					{/each}
				</div>
			{/if}
			{@const expected = app.teamEnvironment.environment.name + '/' + app.name}
			<div class="confirmation-wrapper">
				<BodyShort spacing>
					Confirm deletion by writing <strong>{expected}</strong> in the box below and click
					<em>Delete</em>.
				</BodyShort>
				{#if $deleteApp.errors}
					<GraphErrors errors={$deleteApp.errors} />
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
						loading={$DeleteAppPage.fetching}
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
