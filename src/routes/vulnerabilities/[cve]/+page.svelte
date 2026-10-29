<script lang="ts">
	import PriorityBadge from '#lib/domain/vulnerability/priority/PriorityBadge.svelte';
	import CveImpact from '#lib/domain/vulnerability/CveImpact.svelte';
	import KevGuidance from '#lib/domain/vulnerability/KevGuidance.svelte';
	import { cveWorkloadOrder } from '#lib/domain/vulnerability/cveWorkloadOrder.js';
	import {
		cveWorkloadGroupLabels,
		exhaustiveCveWorkloads,
		groupCveWorkloads
	} from '#lib/domain/vulnerability/cveWorkloadGroups.js';
	import PrioritySignals from '#lib/domain/vulnerability/priority/PrioritySignals.svelte';
	import { priorityDetails } from '#lib/domain/vulnerability/priority/priority.js';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import OrderByMenu from '#lib/ui/OrderByMenu.svelte';
	import { CVEWorkloadOrderField } from '$houdini';
	import { formatImageRef } from '#lib/utils/image.js';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { formatFixVersion, suppressionStateLabels } from '#lib/utils/vulnerabilities.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Alert,
		BodyShort,
		Button,
		Detail,
		Heading,
		HelpText,
		Loader,
		Search
	} from '@nais/ds-svelte-community';
	import { MagnifyingGlassIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const uid = $props.id();
	let { CVEDetails, CVEWorkloads } = $derived(data);
	const orderField = $derived(cveWorkloadOrder(page.url, CVEWorkloadOrderField.TEAM).field);

	let searchValue = $state('');

	const handleSearch = async (event: SubmitEvent) => {
		event.preventDefault();
		const identifier = searchValue.trim();
		if (identifier) {
			searchValue = ''; // Clear the input after submitting
			await goto(`/vulnerabilities/${encodeURIComponent(identifier)}`);
		}
	};

	const isNotFoundError = (errors?: { message: string }[] | null) => {
		return errors?.some((e) => e.message.includes('cve not found'));
	};

	const hasOtherErrors = (errors?: { message: string }[] | null) => {
		return errors?.some((e) => !e.message.includes('cve not found'));
	};

	const hasDetailsLink = (detailsLink?: string | null) => {
		return Boolean(detailsLink?.trim());
	};
</script>

<div class="page">
	<div class="container">
		<form class="search-form" onsubmit={handleSearch}>
			<div class="search-input">
				<Search
					label="Search for vulnerability"
					placeholder="Enter vulnerability ID (e.g., CVE-2024-1234)"
					bind:value={searchValue}
					variant="simple"
					hideLabel={false}
					size="small"
					name="vulnerability"
				/>
			</div>
			<Button type="submit" variant="primary" size="small" icon={MagnifyingGlassIcon}>Search</Button
			>
		</form>

		{#if $CVEDetails.fetching}
			<div class="loading" role="status" aria-label="Loading">
				<Loader size="3xlarge" />
			</div>
		{:else if isNotFoundError($CVEDetails.errors)}
			<Alert variant="warning" size="medium" style="margin-bottom: 1rem;">
				Vulnerability not found. The ID you entered doesn't exist in our database.
			</Alert>
		{:else if $CVEDetails.data}
			{const cve = $derived($CVEDetails.data.cve)}
			{const priority = $derived(priorityDetails(cve.riskAssessment.priority))}
			<div class="wrapper">
				<div class="header">
					<div class="title-row">
						<Heading as="h1" size="large">{cve.identifier}</Heading>
					</div>
					{#if cve.title}
						<Detail>CVE title</Detail>
						<BodyShort>{cve.title}</BodyShort>
					{/if}
				</div>

				<section
					class="priority-card {cve.riskAssessment.priority.toLowerCase()}"
					aria-labelledby="priority-heading"
				>
					<div class="priority-card-header">
						<div>
							<Detail as="p">Operational priority</Detail>
							<Heading as="h2" size="medium" id="priority-heading">
								<PriorityBadge priority={cve.riskAssessment.priority} />
							</Heading>
						</div>
						<div class="priority-explanation">
							<BodyShort size="small" class="priority-guidance">{priority.guidance}</BodyShort>
						</div>
					</div>
				</section>

				<div class="card risk-assessment-card">
					<Heading as="h2" size="small">Severity and threat signals</Heading>
					<div class="risk-assessment-content">
						<div class="risk-assessment-group">
							<Detail as="p">Severity</Detail>
							<div class="risk-assessment-values">
								<span class="severity-badge {cve.severity}">Severity: {cve.severity}</span>
							</div>
						</div>
						<div class="risk-assessment-group">
							<Detail as="p">CVSS</Detail>
							{#if cve.riskAssessment.cvssScore !== null && cve.riskAssessment.cvssScore !== undefined}
								<div class="risk-assessment-values">
									<span class="severity-badge {cve.severity} cvss-score-badge">
										CVSS: {cve.riskAssessment.cvssScore.toFixed(1)}
									</span>
								</div>
							{:else}
								<BodyShort size="small">Not available</BodyShort>
							{/if}
						</div>
						<div class="risk-assessment-signals">
							<Detail as="p">Threat signals</Detail>
							<PrioritySignals
								hasKevEntry={cve.riskAssessment.hasKevEntry}
								knownRansomwareUse={cve.riskAssessment.knownRansomwareUse}
								epssScore={cve.riskAssessment.epssScore}
								epssPercentile={cve.riskAssessment.epssPercentile}
								showEmpty
								emptyText="No threat signal data available."
							/>
						</div>
					</div>
				</div>
				<div class="card">
					<Heading as="h2" size="small" spacing>Details</Heading>
					<BodyShort>
						{#if hasDetailsLink(cve.detailsLink)}
							<ExternalLink href={cve.detailsLink}>View the CVE details</ExternalLink>
						{:else}
							No link available
						{/if}
					</BodyShort>
				</div>
				<KevGuidance entry={cve.kevEntry} detailsLink={cve.detailsLink} />
			</div>
		{:else if hasOtherErrors($CVEDetails.errors)}
			<GraphErrors errors={$CVEDetails.errors} />
		{/if}
		{#if !isNotFoundError($CVEWorkloads.errors)}
			<div>
				<div class="workloads-header">
					<Heading as="h2" size="small">Affected Workloads</Heading>
					<OrderByMenu
						orderField={CVEWorkloadOrderField}
						defaultOrderField={CVEWorkloadOrderField.TEAM}
					/>
				</div>
				{#if $CVEWorkloads.fetching}
					<div class="loading" role="status" aria-label="Loading">
						<Loader size="3xlarge" />
					</div>
				{:else if $CVEWorkloads.data}
					{const workloads = $derived($CVEWorkloads.data.cve.workloads)}
					{const workloadNodes = $derived(exhaustiveCveWorkloads(workloads.nodes))}
					<CveImpact impact={workloads.impact} findingCount={workloads.pageInfo.totalCount} />
					{#if workloadNodes.length > 0}
						<div class="workload-groups">
							{#each groupCveWorkloads(workloadNodes, orderField) as group, index (`${index}-${group.value}`)}
								<section aria-labelledby={`${uid}-cve-finding-group-${index}`}>
									<header class="workload-group-header">
										<div class="workload-group-title">
											<Detail>{cveWorkloadGroupLabels[orderField]}</Detail>
											<Heading as="h3" size="small" id={`${uid}-cve-finding-group-${index}`}>
												{group.value}
											</Heading>
										</div>
										<Detail>
											{group.nodes.length} finding{group.nodes.length === 1 ? '' : 's'} on this page
										</Detail>
									</header>
									<Collection headerless>
										{#each group.nodes as node ([node.workload.name, node.workload.team.slug, node.workload.teamEnvironment.environment.name, node.vulnerability.package].join('|'))}
											{const workload = $derived(node.workload)}
											{const vuln = $derived(node.vulnerability)}
											{const fixVersion = $derived(formatFixVersion(vuln.remediation.fixVersion))}
											<ListItem>
												<div class="workload-container">
													<WorkloadLink {workload} />
													<dl class="workload-details">
														<div class="detail-row">
															<Detail as="dt">Package</Detail>
															<BodyShort as="dd"><code>{vuln.package}</code></BodyShort>
														</div>
														{#if fixVersion}
															<div class="detail-row">
																<Detail as="dt">
																	<span class="fix-version-term">
																		Fixed in
																		<HelpText
																			title="How do I apply the fix?"
																			strategy="fixed"
																			placement="right"
																		>
																			Update the dependency to a version that satisfies the
																			displayed fix requirement, then rebuild and redeploy the
																			image. If it's not relevant here, it can be suppressed
																			instead.
																		</HelpText>
																	</span>
																</Detail>
																<BodyShort as="dd"><code>{fixVersion}</code></BodyShort>
															</div>
														{/if}
														<div class="detail-row">
															<Detail as="dt">Image</Detail>
															{#if workload.image}
																<BodyShort as="dd">
																	<code>{formatImageRef(workload.image)}</code>
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
																		>{suppressionStateLabels[vuln.suppression.state] ??
																			'Unknown'}</code
																	>
																</BodyShort>
															</div>
														{/if}
													</dl>
												</div>
											</ListItem>
										{/each}
									</Collection>
								</section>
							{/each}
						</div>
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
				{:else if hasOtherErrors($CVEWorkloads.errors)}
					<GraphErrors errors={$CVEWorkloads.errors} />
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		margin-top: var(--spacing-layout);
		gap: var(--spacing-layout);
	}

	.fix-version-term {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.search-form {
		display: flex;
		gap: var(--ax-space-12);
		align-items: flex-end;
		margin-bottom: var(--ax-space-16);
		max-width: 600px;
	}

	@media (max-width: 767px) {
		.search-form {
			flex-direction: column;
			align-items: stretch;
		}
	}

	.search-input {
		flex: 1;
		min-width: 0;
		align-items: flex-start;
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

	.priority-card {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		padding: var(--ax-space-20);
		border: var(--ax-space-1) solid var(--ax-border-neutral-subtleA);
		border-left: var(--ax-space-2) solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-8);
		background: var(--ax-neutral-100);
	}

	.priority-card.high {
		border-left-color: var(--ax-border-warning);
	}

	.priority-card.urgent {
		border-left-color: var(--ax-text-danger-decoration);
	}

	.priority-card-header {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--ax-space-16);
	}

	.priority-card :global(h2) {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
		margin: var(--ax-space-4) 0 0;
	}

	.priority-guidance {
		font-weight: var(--ax-font-weight-bold);
		text-align: left;
		color: var(--ax-text-neutral-subtle);
	}

	.priority-explanation {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		max-width: 48ch;
		text-align: left;
	}

	.card {
		padding: var(--ax-space-16);
		border-radius: var(--ax-radius-8);
	}

	.details-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-24);
		margin: 0;
		align-items: stretch;

		& > div {
			display: grid;
			grid-template-rows: auto 1fr;
			gap: var(--ax-space-4);
		}

		& > div :global(dd) {
			display: flex;
			align-items: center;
			margin: 0;
		}
	}

	.risk-assessment-content {
		display: grid;
		grid-template-columns: auto auto minmax(0, 1fr);
		align-items: start;
		gap: var(--ax-space-24);
	}

	.risk-assessment-card {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		background: var(--ax-bg-neutral-soft);
		border: var(--ax-space-1) solid var(--ax-border-neutral-subtleA);
	}

	.risk-assessment-signals {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.risk-assessment-signals :global(ul.signals) {
		flex-wrap: nowrap;
	}

	.risk-assessment-group,
	.risk-assessment-signals {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.risk-assessment-values {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.risk-assessment-content :global(dd) {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	@media (max-width: 767px) {
		.risk-assessment-signals :global(ul.signals) {
			flex-wrap: wrap;
		}
	}

	@media (max-width: 767px) {
		.priority-card-header {
			flex-direction: column;
		}

		.priority-explanation {
			max-width: none;
			text-align: left;
		}

		.risk-assessment-content {
			grid-template-columns: 1fr;
		}
	}

	.workloads-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--ax-space-12);
	}

	.workload-groups {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
	}

	.workload-group-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--ax-space-12);
		padding: var(--ax-space-12) var(--ax-space-24);
		background: var(--ax-bg-neutral-soft);
		border-radius: var(--ax-radius-8) var(--ax-radius-8) 0 0;
	}

	.workload-group-title {
		flex: 1;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.workload-container {
		display: grid;
		grid-template-columns: minmax(200px, 300px) 1fr;
		gap: var(--ax-space-24);
		align-items: start;
	}

	@media (max-width: 767px) {
		.workload-container {
			grid-template-columns: 1fr;
		}

		.priority-card-header {
			flex-direction: column;
		}

		.priority-guidance {
			text-align: left;
		}
	}

	.workload-details {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		margin: 0;
		padding-left: var(--ax-space-12);
		border-left: 2px solid var(--ax-border-subtle);
	}

	@media (max-width: 767px) {
		.workload-details {
			padding-left: 0;
			border-left: none;
		}
	}

	.detail-row {
		display: grid;
		grid-template-columns: 100px 1fr;
		gap: var(--ax-space-12);
		align-items: baseline;
	}

	@media (max-width: 767px) {
		.detail-row {
			grid-template-columns: 1fr;
			gap: var(--ax-space-4);
		}
	}

	.detail-row code {
		word-break: break-all;
	}
	code {
		font-size: 0.9rem;
	}
</style>
