<script lang="ts">
	import ServiceAccountDetail from '$lib/domain/service-accounts/ServiceAccountDetail.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

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
