<script lang="ts">
	import WorkloadVulnerabilitiesPage from '#lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';
	import { onMount, tick } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { JobImageDetails, viewerIsMember } = $derived(data);

	let refreshError = $state('');
	let vulnerabilitiesPage: { refreshLoadedFindings: () => Promise<boolean> } | undefined = $state();

	onMount(() => {
		let ticks = 0;
		let refreshedIdentity: string | undefined;
		let refreshedAt: number | undefined;
		const interval = window.setInterval(async () => {
			if (document.hidden || $JobImageDetails.fetching || !$JobImageDetails.variables) return;
			ticks++;
			const workload = $JobImageDetails.data?.team.environment.workload;
			const image = workload?.__typename === 'Job' ? workload.image : undefined;
			const identity =
				workload?.__typename === 'Job'
					? `${$JobImageDetails.data?.team.slug}/${$JobImageDetails.data?.team.environment.environment.name}/${workload.name}/${workload.image.id}`
					: undefined;
			const previousUpdatedAt = image?.vulnerabilitySummary?.lastUpdated?.getTime();
			if (identity && refreshedIdentity !== identity) {
				refreshedIdentity = identity;
				refreshedAt = previousUpdatedAt;
				refreshError = '';
			}
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
					updatedWorkload?.__typename === 'Job' ? updatedWorkload.image : undefined;
				const updatedIdentity =
					updatedWorkload?.__typename === 'Job'
						? `${result.data?.team.slug}/${result.data?.team.environment.environment.name}/${updatedWorkload.name}/${updatedWorkload.image.id}`
						: undefined;
				const currentWorkload = $JobImageDetails.data?.team.environment.workload;
				const currentIdentity =
					currentWorkload?.__typename === 'Job'
						? `${$JobImageDetails.data?.team.slug}/${$JobImageDetails.data?.team.environment.environment.name}/${currentWorkload.name}/${currentWorkload.image.id}`
						: undefined;
				if (
					identity &&
					identity === updatedIdentity &&
					identity === currentIdentity &&
					updatedImage?.vulnerabilitySummary?.lastUpdated &&
					updatedImage.vulnerabilitySummary.lastUpdated.getTime() !== refreshedAt
				) {
					await tick();
					if (!vulnerabilitiesPage) return;
					if (!(await vulnerabilitiesPage.refreshLoadedFindings())) return;
					refreshedAt = updatedImage.vulnerabilitySummary.lastUpdated.getTime();
				}
				if (
					identity &&
					identity === updatedIdentity &&
					refreshedAt === updatedImage?.vulnerabilitySummary?.lastUpdated?.getTime()
				)
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
