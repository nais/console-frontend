<script lang="ts">
	import WorkloadVulnerabilitiesPage from '$lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { ApplicationImageDetails, viewerIsMember } = $derived(data);

	$effect(() => {
		const workload = $ApplicationImageDetails.data?.team.environment.workload;
		const shouldPoll =
			workload?.image.sbom.status === 'PROCESSING' ||
			!!workload?.image.vulnerabilitySummary?.staleImageTag;
		if (!shouldPoll) return;
		const interval = setInterval(() => {
			if (document.hidden) return;
			ApplicationImageDetails.fetch({ policy: 'NetworkOnly' });
		}, 20000);
		return () => clearInterval(interval);
	});
</script>

<Heading as="h2" size="medium" spacing>Vulnerabilities</Heading>

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
