<script lang="ts">
	import { browser } from '$app/env';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, BodyShort, Button, TextField } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let { PostgresOverview } = $derived(data);
	let postgres = $derived($PostgresOverview.data?.team.environment.postgres);
	let name = $derived(form?.name ?? '');
	let expected = $derived(`${page.params.env}/${page.params.postgres}`);
	let submitting = $state(false);
</script>

<GraphErrors errors={$PostgresOverview.errors} />
{#if postgres}
	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				try {
					await update();
				} finally {
					submitting = false;
				}
			};
		}}
	>
		<Alert variant="warning">
			This permanently deletes {postgres.name}, all its branches and their stored data. Deletion
			continues asynchronously after the request is accepted.
		</Alert>
		{#if (postgres.activeBranch?.workloads.pageInfo.totalCount ?? 0) > 0}
			<Alert variant="warning">
				The active branch is used by {postgres.activeBranch?.workloads.pageInfo.totalCount} workloads.
			</Alert>
		{/if}
		<BodyShort>Remove references to this database from all workloads before deletion.</BodyShort>
		<TextField
			name="name"
			label={`Confirm deletion by typing ${expected}`}
			bind:value={name}
			required
		/>
		{#if form?.error}<Alert variant="error">{form.error}</Alert>{/if}
		<Button
			type="submit"
			variant="danger"
			loading={submitting}
			disabled={browser && name !== expected}
		>
			Delete Postgres
		</Button>
	</form>
{/if}

<style>
	form {
		display: grid;
		gap: var(--ax-space-16);
		max-width: var(--ax-breakpoint-sm);
	}
</style>
