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
	import { parseImage } from '$lib/utils/image';
	import { BodyShort, CopyButton, Detail, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { JobImageDetails, userIsMember } = $derived(data);

	const { registry, repository, name } = $derived(
		parseImage($JobImageDetails.data?.team.environment.workload.image.name)
	);
</script>

<GraphErrors errors={$JobImageDetails.errors} />

{#if $JobImageDetails.data}
	{@const workload = $JobImageDetails.data.team.environment.workload}
	<div class="wrapper">
		<div class="top">
			<div>
				<section class="image-info" aria-labelledby="image-info-title">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<Heading id="image-info-title" as="h3" size="small" spacing>Image</Heading>
						<CopyButton
							copyText={$JobImageDetails.data?.team.environment.workload.image.name +
								':' +
								$JobImageDetails.data?.team.environment.workload.image.tag}
							size="xsmall"
							variant="action"
						/>
					</div>

					<div class="image-row">
						<code>
							{$JobImageDetails.data?.team.environment.workload.image.name}:{$JobImageDetails.data
								?.team.environment.workload.image.tag}
						</code>
					</div>

					{#if registry === '' || repository === '' || name === ''}
						<dl class="kv">
							<div>
								<dt>Name</dt>
								<dd><Detail>{workload.image.name}</Detail></dd>
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
				</section>
				{#if !workload.image.hasSBOM}
					<BodyShort spacing>
						<WarningIcon class="text-aligned-icon" /> No vulnerability data available. Learn how to generate
						SBOMs and attestations for your workloads in the
						<ExternalLink href={docURL('/services/vulnerabilities/how-to/sbom/')}
							>Nais documentation
						</ExternalLink>.
					</BodyShort>
				{/if}
			</div>
			<div class="cards">
				{#if workload.image.hasSBOM}
					<div class="card">
						<Heading as="h2" size="small">Summary</Heading>

						<WorkloadVulnerabilitySummary {workload} />
					</div>
				{/if}
			</div>
		</div>
		{#if workload.image.hasSBOM}
			<div>
				<ImageVulnerabilities
					team={$JobImageDetails.data?.team.slug}
					environment={$JobImageDetails.data?.team.environment.environment.name}
					workload={$JobImageDetails.data?.team.environment.workload.name}
					authorized={userIsMember}
				/>
			</div>
			<WorkloadVulnerabilityHistoryGraph
				team={$JobImageDetails.data?.team.slug}
				environment={$JobImageDetails.data?.team.environment.environment.name}
				workload={$JobImageDetails.data?.team.environment.workload.name}
			/>
			<div>
				{#if $JobImageDetails.data?.team.environment.workload.image.activityLog.edges.length > 0}
					<div class="activity-log">
						<Heading as="h3" size="small" spacing>Image Activity Log</Heading>

						<List>
							{#each $JobImageDetails.data?.team.environment.workload.image.activityLog.edges || [] as item (item.node.id)}
								<ActivityLogListItem item={item.node} />
							{/each}
						</List>
					</div>
				{:else}
					<div class="activity-log">
						<Heading as="h3" size="small" spacing>Image Activity Log</Heading>
						<p class="no-activity">No activity log entries found for this image.</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.top {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.cards {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		.card {
			background-color: var(--ax-bg-sunken);
			padding: var(--ax-space-20);
			border-radius: 12px;
			width: 300px;
		}
		padding-bottom: var(--ax-space-32);
	}

	code {
		font-size: 0.9rem;
	}
	.image-info {
		margin-top: var(--ax-space-16);
	}
	.image-row {
		display: flex;
		gap: var(--ax-space-8);
		align-items: center;
		margin-bottom: var(--ax-space-8);
	}

	.kv {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-4) var(--ax-space-12);
		align-items: baseline;
	}
	.kv > div {
		display: contents;
	}
	.kv dt {
		font-weight: 600;
	}
	.kv dd {
		margin: 0;
	}

	.activity-log {
		margin-top: var(--ax-space-32);
	}

	.no-activity {
		color: var(--ax-text-subtle);
		font-style: italic;
	}
</style>
