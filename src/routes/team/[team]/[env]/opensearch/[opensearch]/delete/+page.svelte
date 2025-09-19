<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import { docURL } from '$lib/doc';
	import { Alert, BodyLong, Button, ErrorMessage, TextField } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { form, data }: PageProps = $props();
	let name = $state('');
	const confirmed = $derived(!browser || name === page.params.env + '/' + page.params.opensearch);

	const { DeleteOpenSearchData } = $derived(data);

	let usesCount = $derived(
		$DeleteOpenSearchData.data?.team.environment.openSearch.access.pageInfo.totalCount ?? 0
	);
</script>

{#if usesCount > 0}
	<Alert variant="warning"
		>This OpenSearch instance is currently <a
			href={resolve('/team/[team]/[env]/opensearch/[opensearch]', {
				team: data.teamSlug,
				env: page.params.env ?? '',
				opensearch: page.params.opensearch ?? ''
			})}>used by {usesCount} workload{usesCount > 1 ? 's' : ''}</a
		>.</Alert
	>
{/if}

<BodyLong style="margin-bottom: 1rem;">
	You should remove all references to this OpenSearch instance from your workloads before deletion.
	See the
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
		label="Confirm deletion by typing {page.params.env}/{page.params.opensearch}"
	/>
	<Button type="submit" variant="danger" disabled={!confirmed}>Delete OpenSearch</Button>
</form>

<style>
	form {
		max-width: 400px;
	}

	:global(form > *) {
		margin-bottom: 1rem;
	}
</style>
