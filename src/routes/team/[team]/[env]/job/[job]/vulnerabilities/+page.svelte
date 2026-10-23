<script lang="ts">
	import WorkloadVulnerabilitiesPage from '#lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { JobImageDetails, viewerIsMember } = $derived(data);

	let refreshError = $state('');
	let vulnerabilitiesPage: { refreshLoadedFindings: () => Promise<void> } | undefined = $state();

	onMount(() => {
		let ticks = 0;
		const interval = window.setInterval(async () => {
			if (document.hidden || $JobImageDetails.fetching || !$JobImageDetails.variables) return;
			ticks++;
			const workload = $JobImageDetails.data?.team.environment.workload;
			const image = workload && 'image' in workload ? workload.image : undefined;
			const previousImageId = image?.id;
			const previousUpdatedAt = image?.vulnerabilitySummary?.lastUpdated?.getTime();
			const processing =
				image?.sbom.status === 'PROCESSING' || !!image?.vulnerabilitySummary?.staleImageTag;
			if (!processing && ticks % 3 !== 0) return;
			try {
				const result = await JobImageDetails.fetch({
					policy: 'NetworkOnly',
					variables: { ...$JobImageDetails.variables }
				});
				const updatedWorkload = result.data?.team.environment.workload;
				const updatedImage =
					updatedWorkload && 'image' in updatedWorkload ? updatedWorkload.image : undefined;
				if (
					previousImageId === updatedImage?.id &&
					updatedImage?.vulnerabilitySummary?.lastUpdated &&
					updatedImage.vulnerabilitySummary.lastUpdated.getTime() !== previousUpdatedAt
				) {
					await vulnerabilitiesPage?.refreshLoadedFindings();
				}
				refreshError = '';
			} catch {
				refreshError = 'Could not refresh vulnerability data. Reload the page to try again.';
			}
		}, 20_000);
		return () => window.clearInterval(interval);
	});
</script>

<Heading as="h2" size="medium" spacing>Vulnerabilities</Heading>

<GraphErrors errors={$JobImageDetails.errors} />
{#if refreshError}<Alert variant="error">{refreshError}</Alert>{/if}

{#if $JobImageDetails.data}
	<WorkloadVulnerabilitiesPage
		bind:this={vulnerabilitiesPage}
		data={$JobImageDetails.data}
		{viewerIsMember}
	/>
{/if}
