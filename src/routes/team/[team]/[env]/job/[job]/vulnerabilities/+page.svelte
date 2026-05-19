<script lang="ts">
	import WorkloadVulnerabilitiesPage from '$lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { JobImageDetails, viewerIsMember } = $derived(data);
</script>

<Heading as="h2" size="medium" spacing>Vulnerabilities</Heading>

<GraphErrors errors={$JobImageDetails.errors} />

{#if $JobImageDetails.data}
	<WorkloadVulnerabilitiesPage data={$JobImageDetails.data} {viewerIsMember} />
{/if}
