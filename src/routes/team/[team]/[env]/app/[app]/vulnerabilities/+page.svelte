<script lang="ts">
	import WorkloadVulnerabilitiesPage from '#lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';
	import { onMount, tick } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { ApplicationImageDetails, viewerIsMember } = $derived(data);

	let refreshError = $state('');
	let vulnerabilitiesPage: { refreshLoadedFindings: () => Promise<boolean> } | undefined = $state();

	onMount(() => {
		let ticks = 0;
		let refreshedIdentity: string | undefined;
		let refreshedAt: number | undefined;
		const interval = window.setInterval(async () => {
			if (
				document.hidden ||
				$ApplicationImageDetails.fetching ||
				!$ApplicationImageDetails.variables
			)
				return;
			ticks++;
			const workload = $ApplicationImageDetails.data?.team.environment.workload;
			const image = workload && 'image' in workload ? workload.image : undefined;
			const identity =
				image &&
				`${$ApplicationImageDetails.data?.team.slug}/${$ApplicationImageDetails.data?.team.environment.environment.name}/${workload?.name}/${image.id}`;
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
				const result = await ApplicationImageDetails.fetch({
					policy: 'NetworkOnly',
					variables: { ...$ApplicationImageDetails.variables }
				});
				const updatedWorkload = result.data?.team.environment.workload;
				const updatedImage =
					updatedWorkload && 'image' in updatedWorkload ? updatedWorkload.image : undefined;
				const updatedIdentity =
					updatedImage &&
					`${result.data?.team.slug}/${result.data?.team.environment.environment.name}/${updatedWorkload?.name}/${updatedImage.id}`;
				const currentWorkload = $ApplicationImageDetails.data?.team.environment.workload;
				const currentImage =
					currentWorkload && 'image' in currentWorkload ? currentWorkload.image : undefined;
				const currentIdentity =
					currentImage &&
					`${$ApplicationImageDetails.data?.team.slug}/${$ApplicationImageDetails.data?.team.environment.environment.name}/${currentWorkload?.name}/${currentImage.id}`;
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

<GraphErrors errors={$ApplicationImageDetails.errors} />
{#if refreshError}<Alert variant="error">{refreshError}</Alert>{/if}

{#if $ApplicationImageDetails.data}
	<WorkloadVulnerabilitiesPage
		bind:this={vulnerabilitiesPage}
		data={$ApplicationImageDetails.data}
		{viewerIsMember}
		hasPagination
		onLoadNextPage={() => ApplicationImageDetails.loadNextPage({ first: 10 })}
		onLoadPreviousPage={() => ApplicationImageDetails.loadPreviousPage({ last: 10 })}
	/>
{/if}
