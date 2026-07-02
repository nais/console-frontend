<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import CreateTokenForm from '$lib/domain/service-accounts/CreateTokenForm.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { ServiceAccountDetail } = $derived(data);

	const serviceAccount = $derived($ServiceAccountDetail.data?.serviceAccount);

	const basePath = $derived(
		resolve('/team/[team]/settings/service_accounts/[serviceAccountID]', {
			team: page.params.team!,
			serviceAccountID: page.params.serviceAccountID!
		})
	);
</script>

<div class="page">
	{#if !serviceAccount}
		<Alert variant="warning">Service account not found.</Alert>
	{:else}
		<CreateTokenForm backHref={basePath} bindingAddHref="{basePath}/binding/add" />
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		max-width: 600px;
	}
</style>
