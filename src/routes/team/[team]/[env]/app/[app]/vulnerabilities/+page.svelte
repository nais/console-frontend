<script lang="ts">
	import WorkloadVulnerabilitiesPage from '$lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { ApplicationImageDetails, viewerIsMember } = $derived(data);
</script>

<Heading as="h2" size="medium">Vulnerabilities</Heading>

<GraphErrors errors={$ApplicationImageDetails.errors} />

{#if $ApplicationImageDetails.data}
	<WorkloadVulnerabilitiesPage
		data={$ApplicationImageDetails.data}
		{viewerIsMember}
		hasPagination
		onLoadNextPage={() => ApplicationImageDetails.loadNextPage({ first: 10 })}
		onLoadPreviousPage={() => ApplicationImageDetails.loadPreviousPage({ last: 10 })}
	/>
{/if}
