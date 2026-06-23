<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import ServiceAccountDetail from '$lib/domain/service-accounts/ServiceAccountDetail.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import PageModal from '$lib/ui/PageModal.svelte';
	import { ChevronLeftIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import AddBindingPage from './binding/add/+page.svelte';
	import CreateTokenPage from './token/create/+page.svelte';

	let { data }: PageProps = $props();
	let { ServiceAccountDetail: query, teamSlug, viewerIsOwner, isAdmin } = $derived(data);

	const serviceAccount = $derived($query.data?.serviceAccount);

	const availableRoles = $derived($query.data?.roles.edges.map(({ node }) => node) ?? []);

	let modalWasOpen = $state(false);

	$effect(() => {
		const isOpen = !!page.state.modalHref;
		if (modalWasOpen && !isOpen) {
			invalidateAll();
		}
		modalWasOpen = isOpen;
	});
</script>

<a href="/team/{teamSlug}/settings/service_accounts" class="back-link">
	<ChevronLeftIcon aria-hidden="true" />
	Service Accounts
</a>

<GraphErrors errors={$query.errors} />
{#if serviceAccount}
	<ServiceAccountDetail
		{serviceAccount}
		basePath="/team/{teamSlug}/settings/service_accounts"
		{availableRoles}
		canManage={viewerIsOwner || isAdmin}
	/>
{/if}

{#if page.state.modalHref?.includes('/binding/add')}
	<PageModal content={AddBindingPage} header="Add workload binding" />
{:else if page.state.modalHref?.includes('/token/create')}
	<PageModal content={CreateTokenPage} header="Create API token" />
{/if}

<style>
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
		text-decoration: none;
		margin-bottom: var(--ax-space-16);
	}

	.back-link:hover {
		color: var(--ax-text-neutral);
		text-decoration: underline;
	}
</style>
