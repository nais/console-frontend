<script lang="ts">
	import { enhance } from '$app/forms';
	import { Alert, BodyLong, Button, ErrorMessage, TextField } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { docURL } from '$lib/doc';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import { resolve } from '$app/paths';

	let { form, data }: PageProps = $props();
	let name = $state('');
	const confirmed = $derived(!browser || name === page.params.env + '/' + page.params.valkey);

	const { DeleteValkeyData } = $derived(data);

	let usesCount = $derived(
		$DeleteValkeyData.data?.team.environment.valkey.access.pageInfo.totalCount ?? 0
	);
</script>

{#if usesCount > 0}
	<Alert variant="warning"
		>This Valkey instance is currently <a
			href={resolve('/team/[team]/[env]/valkey/[valkey]', {
				team: data.teamSlug,
				env: page.params.env ?? '',
				valkey: page.params.valkey ?? ''
			})}>used by {usesCount} workloads</a
		>.</Alert
	>
{/if}

<BodyLong style="margin-bottom: 1rem;">
	You should remove all references to this Valkey instance from your workloads before deletion. See
	the
	<ExternalLink href={docURL('/persistence/opensearch/how-to/delete/')}>
		Nais documentation
	</ExternalLink> for details.
</BodyLong>

{#if form?.error}
	<ErrorMessage>{form.error}</ErrorMessage>
{/if}

<form method="POST" use:enhance>
	<TextField
		name="name"
		bind:value={name}
		label="Confirm deletion by typing {page.params.env}/{page.params.valkey}"
	/>
	<Button type="submit" variant="danger" disabled={!confirmed}>Delete Valkey</Button>
</form>

<style>
	form {
		max-width: 400px;
	}

	:global(form > *) {
		margin-bottom: 1rem;
	}
</style>
