<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import ServiceAccountDetail from '$lib/domain/service-accounts/ServiceAccountDetail.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import PageModal from '$lib/ui/PageModal.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import AddBindingPage from './binding/add/+page.svelte';
	import CreateTokenPage from './token/create/+page.svelte';

	let { data }: PageProps = $props();
	let {
		ServiceAccountDetail: query,
		serviceAccountName,
		teamSlug,
		viewerIsMember
	} = $derived(data);

	const serviceAccount = $derived(
		$query.data?.team.serviceAccounts.nodes.find((sa) => sa.name === serviceAccountName)
	);

	const environments = $derived($query.data?.team.environments ?? []);

	let modalWasOpen = $state(false);
	$effect(() => {
		const isOpen = !!page.state.modalHref;
		if (modalWasOpen && !isOpen) {
			invalidateAll();
		}
		modalWasOpen = isOpen;
	});
</script>

<GraphErrors errors={$query.errors} />
{#if serviceAccount}
	<ServiceAccountDetail
		{serviceAccount}
		{environments}
		{teamSlug}
		roles={$query.data!}
		{viewerIsMember}
	/>
{:else if $query.data}
	<Alert variant="warning">
		Service account <strong>{serviceAccountName}</strong> not found.
	</Alert>
{/if}

{#if page.state.modalHref?.includes('/binding/add')}
	<PageModal content={AddBindingPage} header="Add workload binding" />
{:else if page.state.modalHref?.includes('/token/create')}
	<PageModal content={CreateTokenPage} header="Create API token" />
{/if}
