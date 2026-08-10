<script lang="ts">
	import CreateTokenForm from '$lib/domain/service-accounts/CreateTokenForm.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { AdminServiceAccountDetail } = $derived(data);

	const serviceAccount = $derived($AdminServiceAccountDetail.data?.serviceAccount);

	const basePath = $derived(`/admin/service_accounts/${serviceAccount?.id}`);
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
