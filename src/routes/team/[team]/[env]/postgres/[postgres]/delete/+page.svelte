<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import { docURL } from '$lib/doc';
	import { Alert, BodyLong, Button, ErrorMessage, TextField } from '@nais/ds-svelte-community';
	import { getTeamContext } from '../../../../teamContext.svelte';
	import type { PageProps } from './$houdini';

	let { form, data }: PageProps = $props();
	let name = $state('');
	const confirmed = $derived(!browser || name === page.params.env + '/' + page.params.postgres);

	const { DeletePostgresData } = $derived(data);

	let usesCount = $derived(
		$DeletePostgresData.data?.team.environment.postgresInstance.workloads.pageInfo.totalCount ?? 0
	);

	const teamCtx = getTeamContext();
</script>

{#if usesCount > 0}
	<Alert variant="warning"
		>This Postgres instance is currently <a
			href={resolve('/team/[team]/[env]/postgres/[postgres]', {
				team: data.teamSlug,
				env: page.params.env ?? '',
				postgres: page.params.postgres ?? ''
			})}>used by {usesCount} workload{usesCount > 1 ? 's' : ''}</a
		>.</Alert
	>
{/if}

<BodyLong style="margin-bottom: 1rem;">
	You should remove all references to this Postgres instance from your workloads before deletion.
	See the
	<ExternalLink href={docURL('/persistence/postgresql/how-to/delete-database/')}>
		Nais documentation
	</ExternalLink> for details.
</BodyLong>

{#if form?.error}
	<ErrorMessage>{form.error}</ErrorMessage>
{/if}

<form
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
			teamCtx.refetchInventory();
		};
	}}
>
	<TextField
		name="name"
		bind:value={name}
		label="Confirm deletion by typing {page.params.env}/{page.params.postgres}"
	/>
	<Button type="submit" variant="danger" disabled={!confirmed}>Delete Postgres</Button>
</form>

<style>
	form {
		max-width: 400px;
	}

	form :global(> *) {
		margin-bottom: 1rem;
	}
</style>
