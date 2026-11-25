<script lang="ts">
	import WorkloadFindings from '#lib/domain/vulnerability/WorkloadFindings.svelte';
	import WorkloadVulnerabilitiesPage from '#lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Heading } from '#lib/shadcn/ui/index.js';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const ApplicationImageDetails = $derived(
		data.v0sVulnerabilities ? undefined : data.ApplicationImageDetails
	);
	const ImageFindings = $derived(data.v0sVulnerabilities ? undefined : data.ImageFindings);
	const initialFindingsStatus = $derived(
		data.v0sVulnerabilities ? undefined : data.initialFindingsStatus
	);
	const viewerIsMember = $derived(data.viewerIsMember);

	$effect(() => {
		const workload = $ApplicationImageDetails?.data?.team.environment.workload;
		const image = workload && 'image' in workload ? workload.image : undefined;
		const shouldPoll =
			image?.sbom.status === 'PROCESSING' || !!image?.vulnerabilitySummary?.staleImageTag;
		if (!shouldPoll) return;
		const interval = setInterval(() => {
			if (document.hidden) return;
			ApplicationImageDetails?.fetch({ policy: 'NetworkOnly' });
		}, 20000);
		return () => clearInterval(interval);
	});
</script>

<Heading as="h2" size="medium" spacing>Vulnerabilities</Heading>

{#if data.v0sVulnerabilities}
	{#key data.WorkloadFindings}
		<WorkloadFindings
			store={data.WorkloadFindings}
			team={page.params.team ?? ''}
			environment={page.params.env ?? ''}
			workload={page.params.app ?? ''}
			authorized={viewerIsMember}
		/>
	{/key}
{:else}
	<GraphErrors errors={$ApplicationImageDetails?.errors} />

	{#if $ApplicationImageDetails?.data}
		<WorkloadVulnerabilitiesPage
			data={$ApplicationImageDetails.data}
			initialFindings={ImageFindings}
			{initialFindingsStatus}
			{viewerIsMember}
			hasPagination
			onLoadNextPage={() => ApplicationImageDetails?.loadNextPage({ first: 10 })}
			onLoadPreviousPage={() => ApplicationImageDetails?.loadPreviousPage({ last: 10 })}
		/>
	{/if}
{/if}
