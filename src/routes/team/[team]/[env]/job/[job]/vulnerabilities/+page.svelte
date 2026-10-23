<script lang="ts">
	import WorkloadVulnerabilitiesPage from '#lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { JobImageDetails, viewerIsMember } = $derived(data);

	let refreshError = $state('');

	onMount(() => {
		let ticks = 0;
		const interval = window.setInterval(async () => {
			if (document.hidden || $JobImageDetails.fetching || !$JobImageDetails.variables) return;
			ticks++;
			const workload = $JobImageDetails.data?.team.environment.workload;
			const image = workload && 'image' in workload ? workload.image : undefined;
			const processing =
				image?.sbom.status === 'PROCESSING' || !!image?.vulnerabilitySummary?.staleImageTag;
			if (!processing && ticks % 3 !== 0) return;
			try {
				await JobImageDetails.fetch({
					policy: 'NetworkOnly',
					variables: { ...$JobImageDetails.variables }
				});
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
	<WorkloadVulnerabilitiesPage data={$JobImageDetails.data} {viewerIsMember} />
{/if}
