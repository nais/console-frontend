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
		viewerIsOwner,
		isAdmin
	} = $derived(data);

	const serviceAccount = $derived(
		$query.data?.team.serviceAccounts.nodes.find((sa) => sa.name === serviceAccountName)
	);
	const serviceAccountsPage = $derived($query.data?.team.serviceAccounts);

	let modalWasOpen = $state(false);
	let lookedUpAllPages = $state(false);
	let requestedCursor: string | null = $state(null);

	$effect(() => {
		if (serviceAccount) {
			lookedUpAllPages = true;
			return;
		}

		const connection = serviceAccountsPage;
		if (!connection || $query.fetching) {
			return;
		}

		const nextCursor = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
		if (nextCursor && nextCursor !== requestedCursor) {
			requestedCursor = nextCursor;
			query.fetch({
				variables: {
					team: teamSlug,
					after: nextCursor
				}
			});
			return;
		}

		lookedUpAllPages = true;
	});

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
		{teamSlug}
		roles={$query.data!}
		canManage={viewerIsOwner || isAdmin}
	/>
{:else if lookedUpAllPages}
	<Alert variant="warning">
		Service account <strong>{serviceAccountName}</strong> not found.
	</Alert>
{/if}

{#if page.state.modalHref?.includes('/binding/add')}
	<PageModal content={AddBindingPage} header="Add workload binding" />
{:else if page.state.modalHref?.includes('/token/create')}
	<PageModal content={CreateTokenPage} header="Create API token" />
{/if}
