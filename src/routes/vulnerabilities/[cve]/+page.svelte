<script lang="ts">
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { severityToColor, suppressionStateLabels } from '$lib/utils/vulnerabilities';
	import { BodyShort, Detail, Heading, Loader, ReadMore, Tag } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CVEDetails, CVEWorkloads } = $derived(data);
</script>

<div class="page">
	<div class="container">
		<GraphErrors errors={$CVEDetails.errors} />
		<GraphErrors errors={$CVEWorkloads.errors} />

		{#if $CVEDetails.fetching}
			<div class="loading">
				<Loader size="3xlarge" />
			</div>
		{:else if $CVEDetails.data}
			{@const cve = $CVEDetails.data.cve}
			<div class="wrapper">
				<div class="header">
					<div class="title-row">
						<Heading level="1" size="large">{cve.identifier}</Heading>
						<Tag
							variant="neutral"
							style="background-color: {severityToColor({ severity: cve.severity.toLowerCase() })};"
						>
							{cve.severity}
						</Tag>
					</div>
					{#if cve.title}
						<Detail>{cve.title}</Detail>
					{/if}
				</div>

				<div class="card">
					<Heading level="2" size="small" spacing>Details</Heading>
					<dl class="details-list">
						{#if cve.cvssScore}
							<div>
								<Detail as="dt">CVSS Score</Detail>
								<BodyShort as="dd"><strong>{cve.cvssScore.toFixed(1)}</strong></BodyShort>
							</div>
						{/if}
						<div>
							<Detail as="dt">Severity</Detail>
							<BodyShort as="dd">
								<Tag
									size="small"
									variant="neutral"
									style="background-color: {severityToColor({
										severity: cve.severity.toLowerCase()
									})};"
								>
									{cve.severity}
								</Tag>
							</BodyShort>
						</div>
						<div>
							<Detail as="dt">More Information</Detail>
							<BodyShort as="dd">
								<ExternalLink href={cve.detailsLink}>View full details</ExternalLink>
							</BodyShort>
						</div>
					</dl>
				</div>

				{#if cve.description}
					<ReadMore header="Description" size="medium">
						{cve.description}
					</ReadMore>
				{/if}
				{#if $CVEWorkloads.data}
					{@const workloads = $CVEWorkloads.data.cve.workloads}
					<Heading level="2" size="small">
						Affected Workloads
						{#if workloads.pageInfo.totalCount > 0}
							<span class="count">({workloads.pageInfo.totalCount})</span>
						{/if}
					</Heading>

					{#if workloads.nodes.length > 0 || $CVEWorkloads.fetching}
						<List>
							{#each workloads.nodes as node ([node.workload.name, node.workload.team.slug, node.workload.teamEnvironment.environment.name, node.vulnerability.package].join('|'))}
								{@const workload = node.workload}
								{@const vuln = node.vulnerability}
								<ListItem>
									<div class="workload-container">
										<WorkloadLink {workload} />
										<dl class="workload-details">
											<div class="detail-row">
												<Detail as="dt">Package</Detail>
												<BodyShort as="dd"><code>{vuln.package}</code></BodyShort>
											</div>
											<div class="detail-row">
												<Detail as="dt">Image</Detail>
												{#if workload.image}
													<BodyShort as="dd">
														<code>{workload.image.name}:{workload.image.tag}</code>
													</BodyShort>
												{:else}
													<BodyShort as="dd">-</BodyShort>
												{/if}
											</div>
											{#if vuln.suppression}
												<div class="detail-row">
													<Detail as="dt">Suppression</Detail>
													<BodyShort as="dd">
														<code
															>{suppressionStateLabels[vuln.suppression.state] ?? 'Unknown'}</code
														>
													</BodyShort>
												</div>
											{/if}
										</dl>
									</div>
								</ListItem>
							{/each}
						</List>
						<Pagination
							page={workloads.pageInfo}
							fetching={$CVEWorkloads.fetching}
							loaders={{
								loadPreviousPage: () =>
									changeParams(
										{
											after: '',
											before: workloads.pageInfo.startCursor ?? ''
										},
										{ noScroll: true }
									),
								loadNextPage: () =>
									changeParams(
										{
											after: workloads.pageInfo.endCursor ?? '',
											before: ''
										},
										{ noScroll: true }
									)
							}}
						/>
					{:else}
						<BodyShort>No workloads are currently affected by this vulnerability.</BodyShort>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 500px;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		margin-bottom: var(--ax-space-8);
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
	}

	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16);
		border-radius: 8px;
	}

	.details-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-24);
		margin: 0;
	}

	.count {
		font-weight: normal;
		color: var(--ax-text-neutral);
	}

	.workload-container {
		display: grid;
		grid-template-columns: minmax(200px, 300px) 1fr;
		gap: var(--ax-space-24);
		align-items: start;
	}

	.workload-details {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		margin: 0;
		padding-left: var(--ax-space-12);
		border-left: 2px solid var(--ax-border-subtle);
	}

	.detail-row {
		display: grid;
		grid-template-columns: 100px 1fr;
		gap: var(--ax-space-12);
		align-items: baseline;
	}

	.detail-row code {
		word-break: break-all;
	}
	code {
		font-size: 0.9rem;
	}
</style>
