<script lang="ts">
	import { docURL } from '$lib/doc';
	import ActivityLogListItem from '$lib/domain/list-items/ActivityLogListItem.svelte';
	import ImageVulnerabilities from '$lib/domain/vulnerability/ImageVulnerabilities.svelte';
	import StalenessStatusIcon from '$lib/domain/vulnerability/StalenessStatusIcon.svelte';
	import WorkloadVulnerabilityHistoryGraph from '$lib/domain/vulnerability/WorkloadVulnerabilityHistoryGraph.svelte';
	import WorkloadVulnerabilitySummary from '$lib/domain/vulnerability/WorkloadVulnerabilitySummary.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { parseImage } from '$lib/utils/image';
	import { stalenessDetails } from '$lib/utils/vulnerabilities';
	import { Alert, CopyButton, Detail, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { ApplicationImageDetails, viewerIsMember } = $derived(data);

	const { registry, repository, name } = $derived(
		parseImage($ApplicationImageDetails.data?.team.environment.workload.image.name)
	);
</script>

<GraphErrors errors={$ApplicationImageDetails.errors} />

{#if $ApplicationImageDetails.data}
	{@const workload = $ApplicationImageDetails.data.team.environment.workload}
	{@const hasVulnerabilityData = workload.image.hasSBOM && workload.image.vulnerabilitySummary}
	{@const imageStaleness = stalenessDetails(workload.image)}
	<div class="wrapper">
		<div class="top">
			<div>
				<section class="image-info" aria-labelledby="image-info-title">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<Heading id="image-info-title" as="h3" size="small" spacing>Image</Heading>
						<CopyButton
							copyText={$ApplicationImageDetails.data?.team.environment.workload.image.name +
								':' +
								$ApplicationImageDetails.data?.team.environment.workload.image.tag}
							size="xsmall"
							variant="action"
						/>
					</div>

					<div class="image-row">
						<code>
							{$ApplicationImageDetails.data?.team.environment.workload.image
								.name}:{$ApplicationImageDetails.data?.team.environment.workload.image.tag}
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
				{#if !hasVulnerabilityData}
					<Alert variant="info" size="small" fullWidth={false}>
						{imageStaleness.text}
						{#if imageStaleness.code === 'NO_SBOM'}
							<ExternalLink href={docURL('/services/vulnerabilities/how-to/sbom/')}
								>Read how to generate an SBOM</ExternalLink
							>.
						{/if}
					</Alert>
				{/if}
			</div>
			<div class="cards">
				{#if hasVulnerabilityData}
					<div class="card">
						<div style="display: flex; align-items: center; gap: var(--ax-space-4);">
							<Heading as="h2" size="small">Summary</Heading>
							<StalenessStatusIcon
								indicator={imageStaleness.indicator}
								label={imageStaleness.label}
							/>
						</div>

						<WorkloadVulnerabilitySummary {workload} />
					</div>
				{/if}
			</div>
		</div>
		{#if hasVulnerabilityData}
			<div>
				<ImageVulnerabilities
					team={$ApplicationImageDetails.data?.team.slug}
					environment={$ApplicationImageDetails.data?.team.environment.environment.name}
					workload={$ApplicationImageDetails.data?.team.environment.workload.name}
					authorized={viewerIsMember}
				/>
			</div>
			<div>
				{#if $ApplicationImageDetails.data?.team.environment.workload.image.activityLog.edges.length > 0}
					<div class="activity-log">
						<List title="Image Activity Log">
							{#each $ApplicationImageDetails.data?.team.environment.workload.image.activityLog.edges || [] as item (item.node.id)}
								<ActivityLogListItem item={item.node} />
							{/each}
						</List>
						{#if $ApplicationImageDetails.data.team.environment.workload.image.activityLog.pageInfo.hasPreviousPage || $ApplicationImageDetails.data.team.environment.workload.image.activityLog.pageInfo.hasNextPage}
							<Pagination
								page={$ApplicationImageDetails.data.team.environment.workload.image.activityLog
									.pageInfo}
								loaders={{
									loadNextPage: () => {
										ApplicationImageDetails.loadNextPage({ first: 10 });
									},
									loadPreviousPage: () => {
										ApplicationImageDetails.loadPreviousPage({
											last: 10
										});
									}
								}}
							/>
						{/if}
					</div>
				{:else}
					<div class="activity-log">
						<Heading as="h3" size="small" spacing>Image Activity Log</Heading>
						<p class="no-activity">No activity log entries found for this image.</p>
					</div>
				{/if}
			</div>
			<div>
				<WorkloadVulnerabilityHistoryGraph
					team={$ApplicationImageDetails.data?.team.slug}
					environment={$ApplicationImageDetails.data?.team.environment.environment.name}
					workload={$ApplicationImageDetails.data?.team.environment.workload.name}
				/>
			</div>
		{/if}
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-layout);
	}
	.wrapper > * {
		min-width: 0;
	}
	.top {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.top > * {
		min-width: 0;
	}
	.cards {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		.card {
			padding: var(--ax-space-20);
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
		max-width: 100%;
		overflow-x: auto;
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

	@media (max-width: 767px), (max-height: 500px) {
		.top {
			grid-template-columns: 1fr;
		}

		.cards {
			padding-bottom: 0;
		}

		.cards .card {
			width: 100%;
		}
	}
</style>
