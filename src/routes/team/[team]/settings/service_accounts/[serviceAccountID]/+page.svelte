<script lang="ts">
	import ServiceAccountDetail from '$lib/domain/service-accounts/ServiceAccountDetail.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { ServiceAccountDetail: query, teamSlug, viewerIsOwner, isAdmin } = $derived(data);

	const serviceAccount = $derived($query.data?.serviceAccount);

	const availableRoles = $derived($query.data?.roles.edges.map(({ node }) => node) ?? []);
</script>

<GraphErrors errors={$query.errors} />
{#if serviceAccount}
	<ServiceAccountDetail
		{serviceAccount}
		basePath="/team/{teamSlug}/settings/service_accounts"
		{availableRoles}
		canManage={viewerIsOwner || isAdmin}
	/>
{/if}
