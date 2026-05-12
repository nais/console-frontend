<script lang="ts">
	import { docURL } from '$lib/doc';
	import ActivityLogListItem from '$lib/domain/list-items/ActivityLogListItem.svelte';
	import ImageVulnerabilities from '$lib/domain/vulnerability/ImageVulnerabilities.svelte';
	import WorkloadVulnerabilityHistoryGraph from '$lib/domain/vulnerability/WorkloadVulnerabilityHistoryGraph.svelte';
	import WorkloadVulnerabilitySummary from '$lib/domain/vulnerability/WorkloadVulnerabilitySummary.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { parseImage } from '$lib/utils/image';
	import { BodyShort, CopyButton } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { JobImageDetails, viewerIsMember } = $derived(data);

	const { registry, repository, name } = $derived(
		parseImage($JobImageDetails.data?.team.environment.workload.image.name)
	);
</script>

<GraphErrors errors={$JobImageDetails.errors} />

{#if $JobImageDetails.data}
	{@const workload = $JobImageDetails.data.team.environment.workload}
	<div class="wrapper">
		<SurfaceCard title="Image">
			{#snippet headerAside()}
				<CopyButton
					copyText={workload.image.name + ':' + workload.image.tag}
					size="xsmall"
					variant="action"
				/>
			{/snippet}

			{#if registry === '' || repository === '' || name === ''}
				<dl class="kv">
					<div>
						<dt>Name</dt>
						<dd><code>{workload.image.name}</code></dd>
					</div>
					<div>
						<dt>Tag</dt>
						<dd><code>{workload.image.tag}</code></dd>
					</div>
				</dl>
			{:else}
				<dl class="kv">
					<div>
						<dt>Registry</dt>
						<dd><code>{registry}</code></dd>
					</div>
					<div>
						<dt>Repository</dt>
						<dd><code>{repository}</code></dd>
					</div>
					<div>
						<dt>Name</dt>
						<dd><code>{name}</code></dd>
					</div>
					<div>
						<dt>Tag</dt>
						<dd><code>{workload.image.tag}</code></dd>
					</div>
				</dl>
			{/if}

			{#if !workload.image.hasSBOM}
				<BodyShort size="small" spacing>
					<WarningIcon class="text-aligned-icon" /> No vulnerability data available. Learn how to generate
					SBOMs and attestations for your workloads in the
					<ExternalLink href={docURL('/services/vulnerabilities/how-to/sbom/')}
						>Nais documentation
					</ExternalLink>.
				</BodyShort>
			{/if}
		</SurfaceCard>

		{#if workload.image.hasSBOM}
			<SurfaceCard title="Summary" bordered>
				<WorkloadVulnerabilitySummary {workload} />
			</SurfaceCard>

			<SurfaceCard title="Vulnerabilities">
				<ImageVulnerabilities
					team={$JobImageDetails.data?.team.slug}
					environment={$JobImageDetails.data?.team.environment.environment.name}
					workload={$JobImageDetails.data?.team.environment.workload.name}
					authorized={viewerIsMember}
				/>
			</SurfaceCard>

			{#if $JobImageDetails.data?.team.environment.workload.image.activityLog.edges.length > 0}
				<SurfaceCard title="Image activity log">
					<List>
						{#each $JobImageDetails.data?.team.environment.workload.image.activityLog.edges || [] as item (item.node.id)}
							<ActivityLogListItem item={item.node} />
						{/each}
					</List>
				</SurfaceCard>
			{:else}
				<BodyShort size="small" textColor="subtle"
					>No activity log entries found for this image.</BodyShort
				>
			{/if}
			<SurfaceCard title="Vulnerability history">
				<WorkloadVulnerabilityHistoryGraph
					team={$JobImageDetails.data?.team.slug}
					environment={$JobImageDetails.data?.team.environment.environment.name}
					workload={$JobImageDetails.data?.team.environment.workload.name}
				/>
			</SurfaceCard>
		{/if}
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
	}

	code {
		font-size: var(--ax-font-size-small);
		font-family: monospace;
	}

	.kv {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-4) var(--ax-space-12);
		align-items: baseline;
		font-size: var(--ax-font-size-small);
	}

	.kv > div {
		display: contents;
	}

	.kv dt {
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral);
	}

	.kv dd {
		margin: 0;
		color: var(--ax-text-neutral-subtle);
	}
</style>
