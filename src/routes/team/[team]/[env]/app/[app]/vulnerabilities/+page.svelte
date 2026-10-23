<script lang="ts">
	import WorkloadVulnerabilitiesPage from '#lib/domain/vulnerability/WorkloadVulnerabilitiesPage.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { ApplicationImageDetails, viewerIsMember } = $derived(data);

	let refreshError = $state('');

	onMount(() => {
		let ticks = 0;
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
			const processing =
				image?.sbom.status === 'PROCESSING' || !!image?.vulnerabilitySummary?.staleImageTag;
			if (!processing && ticks % 3 !== 0) return;
			try {
				await ApplicationImageDetails.fetch({
					policy: 'NetworkOnly',
					variables: { ...$ApplicationImageDetails.variables }
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

<GraphErrors errors={$ApplicationImageDetails.errors} />
{#if refreshError}<Alert variant="error">{refreshError}</Alert>{/if}

{#if $ApplicationImageDetails.data}
	<WorkloadVulnerabilitiesPage
		data={$ApplicationImageDetails.data}
		{viewerIsMember}
		hasPagination
		onLoadNextPage={() => ApplicationImageDetails.loadNextPage({ first: 10 })}
		onLoadPreviousPage={() => ApplicationImageDetails.loadPreviousPage({ last: 10 })}
	/>
{/if}
