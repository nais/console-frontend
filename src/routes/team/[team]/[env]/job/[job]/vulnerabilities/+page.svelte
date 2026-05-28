<script lang="ts">
	import WorkloadVulnerabilitiesPage from '$lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { JobImageDetails, viewerIsMember } = $derived(data);

	$effect(() => {
		if ($JobImageDetails.data?.team.environment.workload.image.sbom.status !== 'PROCESSING') return;
		const interval = setInterval(() => {
			if (document.hidden) return;
			JobImageDetails.fetch({ policy: 'NetworkOnly' });
		}, 20000);
		return () => clearInterval(interval);
	});
</script>

<Heading as="h2" size="medium" spacing>Vulnerabilities</Heading>

<GraphErrors errors={$JobImageDetails.errors} />

{#if $JobImageDetails.data}
	<WorkloadVulnerabilitiesPage data={$JobImageDetails.data} {viewerIsMember} />
{/if}
