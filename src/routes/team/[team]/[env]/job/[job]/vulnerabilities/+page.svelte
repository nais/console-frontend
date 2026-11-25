<script lang="ts">
	import WorkloadFindings from '#lib/domain/vulnerability/WorkloadFindings.svelte';
	import WorkloadVulnerabilitiesPage from '#lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Heading } from '#lib/shadcn/ui/index.js';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const JobImageDetails = $derived(data.v0sVulnerabilities ? undefined : data.JobImageDetails);
	const ImageFindings = $derived(data.v0sVulnerabilities ? undefined : data.ImageFindings);
	const initialFindingsStatus = $derived(
		data.v0sVulnerabilities ? undefined : data.initialFindingsStatus
	);
	const viewerIsMember = $derived(data.viewerIsMember);

	$effect(() => {
		const workload = $JobImageDetails?.data?.team.environment.workload;
		const image = workload && 'image' in workload ? workload.image : undefined;
		const shouldPoll =
			image?.sbom.status === 'PROCESSING' || !!image?.vulnerabilitySummary?.staleImageTag;
		if (!shouldPoll) return;
		const interval = setInterval(() => {
			if (document.hidden) return;
			JobImageDetails?.fetch({ policy: 'NetworkOnly' });
		}, 20000);
		return () => clearInterval(interval);
	});
</script>

<Heading as="h2" size="medium" spacing>Vulnerabilities</Heading>

{#if data.v0sVulnerabilities}
	<WorkloadFindings
		team={page.params.team ?? ''}
		environment={page.params.env ?? ''}
		workload={page.params.job ?? ''}
		authorized={viewerIsMember}
	/>
{:else}
	<GraphErrors errors={$JobImageDetails?.errors} />

	{#if $JobImageDetails?.data}
		<WorkloadVulnerabilitiesPage
			data={$JobImageDetails.data}
			initialFindings={ImageFindings}
			{initialFindingsStatus}
			{viewerIsMember}
		/>
	{/if}
{/if}
