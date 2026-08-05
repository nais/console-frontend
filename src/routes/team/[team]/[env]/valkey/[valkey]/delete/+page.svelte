<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { docURL } from '$lib/doc';
	import { deleteConfirmationForm } from '$lib/forms/delete-confirmation';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import Form from '$lib/ui/Form/Form.svelte';
	import { Alert, BodyLong, Button } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { form, data }: PageProps = $props();

	const { DeleteValkeyData } = $derived(data);

	let usesCount = $derived(
		$DeleteValkeyData.data?.team.environment.valkey.access.pageInfo.totalCount ?? 0
	);

	const expected = $derived(`${page.params.env}/${page.params.valkey}`);
	const fields = $derived(deleteConfirmationForm(expected));
	const backHref = $derived(
		resolve('/team/[team]/[env]/valkey/[valkey]', {
			team: data.teamSlug,
			env: page.params.env ?? '',
			valkey: page.params.valkey ?? ''
		})
	);
</script>

<div class="page">
	{#if usesCount > 0}
		<Alert variant="warning">
			This Valkey instance is currently
			<a href={backHref}>used by {usesCount} workload{usesCount > 1 ? 's' : ''}</a>.
		</Alert>
	{/if}

	<BodyLong>
		You should remove all references to this Valkey instance from your workloads before deletion.
		See the
		<ExternalLink href={docURL('/persistence/valkey/how-to/delete/')}
			>Nais documentation</ExternalLink
		> for details.
	</BodyLong>

	<Form {fields} {form}>
		{#snippet button({ submitting })}
			<Button type="submit" size="small" variant="danger" loading={submitting}>
				Delete Valkey
			</Button>
		{/snippet}
		{#snippet actions()}
			<Button as="a" size="small" variant="tertiary" href={backHref}>Cancel</Button>
		{/snippet}
	</Form>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		max-width: 600px;
	}
</style>
