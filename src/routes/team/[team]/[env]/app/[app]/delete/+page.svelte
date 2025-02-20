<script lang="ts">
	import { goto } from '$app/navigation';
	import { type DeleteAppPage$result, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import PersistenceList from '$lib/components/persistence/PersistenceList.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Button, HelpText, TextField } from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { DeleteAppPage } = $derived(data);

	const deleteApp = graphql(`
		mutation DeleteApp($team: Slug!, $env: String!, $app: String!) {
			deleteApplication(input: { teamSlug: $team, environmentName: $env, name: $app }) {
				success
			}
		}
	`);

	let confirmation = $state('');

	const submit = async () => {
		const app = get(DeleteAppPage).data?.team.environment.application;
		if (!app) {
			return;
		}

		const resp = await deleteApp.mutate({
			app: app.name,
			env: app.environment.name,
			team: app.team.slug
		});

		if (resp.data?.deleteApplication.success) {
			goto(`/team/${app.team.slug}?deleted=app/${app.name}`);
		}
	};

	function hasResourcesToDelete(app: DeleteAppPage$result['team']['environment']['application']) {
		return (
			app.sqlInstances.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			app.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			app.buckets.nodes.filter((s) => s.cascadingDelete).length > 0 ||
			app.redisInstances.nodes.length > 0 ||
			app.valkeyInstances.nodes.length > 0
		);
	}

	function hasOrphans(app: DeleteAppPage$result['team']['environment']['application']) {
		return (
			app.sqlInstances.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			app.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete).length > 0 ||
			app.buckets.nodes.filter((s) => !s.cascadingDelete).length > 0
		);
	}
</script>

{#if $DeleteAppPage?.data?.team.environment.application}
	{@const app = $DeleteAppPage?.data?.team.environment.application}
	<Card borderColor="var(--a-border-danger)">
		{#if hasResourcesToDelete(app)}
			<p>
				In addition to the application the following resources
				<strong>will be permanently deleted</strong>:
			</p>
		{/if}

		<div>
			{#each app.sqlInstances.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
				<PersistenceList persistence={node}>
					This will be deleted because <code>cascadingDelete</code>
					is set to
					<code>true</code>
					in the manifest.
				</PersistenceList>
			{/each}
			{#each app.bigQueryDatasets.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
				<PersistenceList persistence={node}>
					This will be deleted because <code>cascadingDelete</code>
					is set to
					<code>true</code>
					in the manifest.
				</PersistenceList>
			{/each}
			{#each app.buckets.nodes.filter((s) => s.cascadingDelete) as node (node.id)}
				<PersistenceList persistence={node}
					>This will be deleted because <code>cascadingDelete</code> is set to <code>true</code> in the
					manifest.
				</PersistenceList>
			{/each}
			{#each app.redisInstances.nodes as node (node.id)}
				<PersistenceList persistence={node}
					>If this Redis instance is defined on team level, it won't be deleted. If it's created by
					the app, it will be permanently deleted.
				</PersistenceList>
			{/each}
			{#each app.valkeyInstances.nodes as node (node.id)}
				<PersistenceList persistence={node}
					>If this Valkey instance is defined on team level, it won't be deleted. If it's created by
					the app, it will be permanently deleted.
				</PersistenceList>
			{/each}
		</div>

		{#if hasOrphans(app)}
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
				{#each app.sqlInstances.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
					<PersistenceList persistence={node} />
				{/each}
				{#each app.bigQueryDatasets.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
					<PersistenceList persistence={node} />
				{/each}
				{#each app.buckets.nodes.filter((s) => !s.cascadingDelete) as node (node.id)}
					<PersistenceList persistence={node} />
				{/each}
			</div>
		{/if}
		{@const expected = app.environment.name + '/' + app.name}
		<p>
			Confirm deletion by writing <strong>{expected}</strong> in the box below and click
			<em>Delete</em>
		</p>
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
			<Button disabled={confirmation !== expected} variant="danger" loading={$deleteApp.fetching}>
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
