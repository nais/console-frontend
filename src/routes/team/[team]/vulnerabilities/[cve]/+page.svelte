<script lang="ts">
	import BulkSuppressCVE, {
		type BulkSuppressWorkload
	} from '#lib/domain/vulnerability/BulkSuppressCVE.svelte';
	import PriorityBadge from '#lib/domain/vulnerability/priority/PriorityBadge.svelte';
	import CveImpact from '#lib/domain/vulnerability/CveImpact.svelte';
	import { cveWorkloadOrder } from '#lib/domain/vulnerability/cveWorkloadOrder.js';
	import {
		cveWorkloadGroupLabels,
		cveVulnerabilitySelections,
		exhaustiveCveWorkloads,
		groupCveWorkloads
	} from '#lib/domain/vulnerability/cveWorkloadGroups.js';
	import OrderByMenu from '#lib/ui/OrderByMenu.svelte';
	import { CVEWorkloadOrderField } from '$houdini';
	import { page } from '$app/state';
	import PrioritySignals from '#lib/domain/vulnerability/priority/PrioritySignals.svelte';
	import { priorityDetails } from '#lib/domain/vulnerability/priority/priority.js';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import { formatImageRef } from '#lib/utils/image.js';
	import { goto } from '$app/navigation';

	import { formatFixVersion, suppressionStateLabels } from '#lib/utils/vulnerabilities.js';
	import {
		Alert,
		BodyShort,
		Button,
		Checkbox,
		Detail,
		Heading,
		HelpText,
		Loader,
		Search
	} from '@nais/ds-svelte-community';
	import { MagnifyingGlassIcon } from '@nais/ds-svelte-community/icons';
	import { SvelteSet } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const uid = $props.id();
	let { TeamCVEPage, TeamCVEWorkloads, teamSlug, cveIdentifier, rows } = $derived(data);
	const orderField = $derived(cveWorkloadOrder(page.url, CVEWorkloadOrderField.PACKAGE).field);
	const workloadNodes = $derived(
		exhaustiveCveWorkloads(
			($TeamCVEWorkloads.data?.cve.workloads.edges ?? []).map(({ node }) => node)
		)
	);

	let searchValue = $state('');
	let selectedIds = new SvelteSet<string>();
	const vulnerabilitySelections = $derived(cveVulnerabilitySelections(workloadNodes, selectedIds));
	let bulkOpen = $state(false);

	const rowKey = (node: { id: string }) => node.id;

	const viewerIsMember = $derived($TeamCVEPage.data?.team.viewerIsMember ?? false);

	const handleSearch = async (event: SubmitEvent) => {
		event.preventDefault();
		const identifier = searchValue.trim();
		if (identifier) {
			searchValue = '';
			await goto(
				`/team/${encodeURIComponent(teamSlug)}/vulnerabilities/${encodeURIComponent(identifier)}`
			);
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

	let loadingMore = $state(false);

	const hasNextPage = $derived($TeamCVEWorkloads.data?.cve.workloads.pageInfo.hasNextPage ?? false);

	async function loadMore() {
		loadingMore = true;
		try {
			await TeamCVEWorkloads.loadNextPage({ first: rows });
		} finally {
			loadingMore = false;
		}
	}

	const toggleSelect = (selection: { nodes: WorkloadNode[]; checked: boolean }) => {
		if (selection.checked) {
			selection.nodes.forEach((n) => selectedIds.delete(n.id));
		} else {
			selection.nodes.forEach((n) => selectedIds.add(n.id));
		}
	};

	const selectableNodes = $derived.by(() => {
		const suppressedVulnIds = new Set(
			workloadNodes.filter((n) => n.vulnerability.suppression).map((n) => n.vulnerability.id)
		);
		return workloadNodes.filter((n) => !suppressedVulnIds.has(n.vulnerability.id));
	});

	const toggleAll = () => {
		if (allSelected(selectableNodes)) {
			selectableNodes.forEach((n) => selectedIds.delete(rowKey(n)));
		} else {
			selectableNodes.forEach((n) => selectedIds.add(rowKey(n)));
		}
	};

	const allSelected = (nodes: { id: string }[]) => {
		return nodes.length > 0 && nodes.every((n) => selectedIds.has(rowKey(n)));
	};

	const anySelected = (nodes: { id: string }[]) => {
		return nodes.some((n) => selectedIds.has(rowKey(n)));
	};

	type WorkloadNode = (typeof workloadNodes)[number];

	const bulkWorkloads = $derived.by((): BulkSuppressWorkload[] => {
		return workloadNodes
			.filter((n) => selectedIds.has(rowKey(n)))
			.map((n) => ({
				rowKey: rowKey(n),
				vulnerabilityId: n.vulnerability.id,
				workloadName: n.workload.name,
				teamSlug: n.workload.team.slug,
				environmentName: n.workload.teamEnvironment.environment.name,
				package: n.vulnerability.package
			}));
	});

	const onSuppressed = () => {
		const loadedCount = ($TeamCVEWorkloads.data?.cve.workloads.edges ?? []).length;
		selectedIds.clear();
		TeamCVEWorkloads.fetch({
			variables: {
				identifier: cveIdentifier,
				first: Math.max(rows, loadedCount),
				filter: { teamSlugs: [teamSlug] },
				orderBy: cveWorkloadOrder(page.url, CVEWorkloadOrderField.PACKAGE)
			},
			policy: 'NetworkOnly'
		});
	};
</script>

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
		<Button type="submit" variant="primary" size="small" icon={MagnifyingGlassIcon}>Search</Button>
	</form>

	{#if $TeamCVEPage.fetching}
		<div class="loading" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else if isNotFoundError($TeamCVEPage.errors)}
		<Alert variant="warning" size="medium">
			Vulnerability not found. The ID you entered doesn't exist in our database.
		</Alert>
	{:else if $TeamCVEPage.data}
		{const cve = $derived($TeamCVEPage.data.cve)}
		{const priority = $derived(priorityDetails(cve.riskAssessment.priority))}
		<div class="wrapper">
			{#if cve.title}
				<div class="vulnerability-type">
					<Detail>CVE title</Detail>
					<BodyShort>{cve.title}</BodyShort>
				</div>
			{/if}

			<section class="risk-assessment-card" aria-labelledby="cve-details">
				<Heading as="h2" size="small" id="cve-details"
					>Priority, severity and threat signals</Heading
				>
				<div class="risk-assessment-content">
					<div class="risk-assessment-group">
						<Detail as="p">Operational priority</Detail>
						<div class="risk-assessment-values">
							<PriorityBadge priority={cve.riskAssessment.priority} />
						</div>
						<BodyShort size="small">{priority.guidance}</BodyShort>
					</div>
					<div class="risk-assessment-group">
						<Detail as="p">Severity and CVSS</Detail>
						<div class="risk-assessment-values">
							<span class="severity-badge {cve.severity}">Severity: {cve.severity}</span>
							{#if cve.riskAssessment.cvssScore !== null && cve.riskAssessment.cvssScore !== undefined}
								<span class="severity-badge {cve.severity} cvss-score-badge">
									CVSS: {cve.riskAssessment.cvssScore.toFixed(1)}
								</span>
							{/if}
						</div>
					</div>
					<div class="risk-assessment-signals">
						<Detail as="p">Threat signals</Detail>
						<PrioritySignals
							hasKevEntry={cve.riskAssessment.hasKevEntry}
							knownRansomwareUse={cve.riskAssessment.knownRansomwareUse}
							epssScore={cve.riskAssessment.epssScore}
							epssPercentile={cve.riskAssessment.epssPercentile}
						/>
					</div>
				</div>

				{#if cve.description}
					<div class="vulnerability-description">
						<Heading as="h3" size="small">Description</Heading>
						<BodyShort class="cve-description">{cve.description}</BodyShort>
					</div>
				{/if}
				{#if hasDetailsLink(cve.detailsLink)}
					<BodyShort>
						<ExternalLink href={cve.detailsLink}>View the CVE details</ExternalLink>
					</BodyShort>
				{/if}
			</section>
		</div>
	{:else if hasOtherErrors($TeamCVEPage.errors)}
		<GraphErrors errors={$TeamCVEPage.errors} />
	{/if}

	{#if !isNotFoundError($TeamCVEPage.errors)}
		<div>
			<div class="workloads-header">
				<Heading as="h2" size="small" spacing>Affected Workloads</Heading>
				<OrderByMenu
					orderField={CVEWorkloadOrderField}
					defaultOrderField={CVEWorkloadOrderField.PACKAGE}
					onlyInclude={Object.values(CVEWorkloadOrderField).filter(
						(field) => field !== CVEWorkloadOrderField.TEAM
					)}
				/>
				{#if viewerIsMember && bulkWorkloads.length > 0}
					<Button
						variant="primary"
						size="small"
						onclick={() => {
							bulkOpen = true;
						}}
					>
						Suppress {bulkWorkloads.length} selected
					</Button>
				{/if}
			</div>

			{#if viewerIsMember}
				<BodyShort>
					Select workloads to suppress this vulnerability. Suppressed findings will be excluded from
					vulnerability reports.
				</BodyShort>
			{/if}

			{#if $TeamCVEWorkloads.fetching && !$TeamCVEWorkloads.data}
				<div class="loading" role="status" aria-label="Loading">
					<Loader size="3xlarge" />
				</div>
			{:else if $TeamCVEWorkloads.data}
				{const workloads = $derived($TeamCVEWorkloads.data.cve.workloads)}
				<CveImpact impact={workloads.impact} findingCount={workloads.pageInfo.totalCount} />
				{#if workloadNodes.length > 0}
					{#if viewerIsMember}
						<div class="select-all-row">
							<Checkbox
								checked={allSelected(selectableNodes)}
								indeterminate={anySelected(selectableNodes) && !allSelected(selectableNodes)}
								onchange={() => toggleAll()}
								disabled={selectableNodes.length === 0}
								readonly={selectableNodes.length === 0}
							>
								Select all for this team ({selectableNodes.length} workload{selectableNodes.length !==
								1
									? 's'
									: ''} with this vulnerability that are not already suppressed)
							</Checkbox>
						</div>
					{/if}
					<div class="workload-groups">
						{#each groupCveWorkloads(workloadNodes, orderField) as workloadGroup, index (`${index}-${workloadGroup.value}`)}
							<section aria-labelledby={`${uid}-cve-finding-group-${index}`}>
								<header class="workload-group-header">
									<div class="workload-group-title">
										<Detail>{cveWorkloadGroupLabels[orderField]}</Detail>
										<Heading as="h3" size="small" id={`${uid}-cve-finding-group-${index}`}>
											{workloadGroup.value}
										</Heading>
									</div>
									<Detail>
										{workloadGroup.nodes.length} finding{workloadGroup.nodes.length === 1
											? ''
											: 's'}
										loaded
									</Detail>
								</header>
								<Collection headerless>
									{#each workloadGroup.nodes as node (node.id)}
										{const workload = $derived(node.workload)}
										{const vuln = $derived(node.vulnerability)}
										{const selection = $derived(vulnerabilitySelections.get(vuln.id)!)}
										{const fixVersion = $derived(formatFixVersion(vuln.remediation.fixVersion))}
										<ListItem>
											<div class="workload-container">
												<div class="workload-identity">
													{#if viewerIsMember}
														<Checkbox
															checked={selection.checked}
															indeterminate={selection.indeterminate}
															onchange={() => {
																if (!vuln.suppression) toggleSelect(selection);
															}}
															disabled={!!vuln.suppression}
															readonly={!!vuln.suppression}
															hideLabel
														>
															Select all workloads with package {vuln.package}
														</Checkbox>
													{/if}
													<WorkloadLink {workload} />
												</div>
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
																		Update the dependency to a version that satisfies the displayed
																		fix requirement, then rebuild and redeploy the image. If it's
																		not relevant here, it can be suppressed instead.
																	</HelpText>
																</span>
															</Detail>
															<BodyShort as="dd"><code>{fixVersion}</code></BodyShort>
														</div>
													{/if}
													{#if vuln.remediation.latestVersion}
														<div class="detail-row">
															<Detail as="dt">Latest version</Detail>
															<BodyShort as="dd"
																><code>{vuln.remediation.latestVersion}</code></BodyShort
															>
														</div>
													{/if}
													<div class="detail-row">
														<Detail as="dt">Image</Detail>
														<BodyShort as="dd">
															{#if workload.image}
																<code>{formatImageRef(workload.image)}</code>
															{:else}
																-
															{/if}
														</BodyShort>
													</div>
													{#if vuln.suppression}
														<div class="detail-row">
															<Detail as="dt">Suppression</Detail>
															<BodyShort as="dd">
																<code
																	>{suppressionStateLabels[vuln.suppression.state] ??
																		'Suppressed'}</code
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
				{:else}
					<BodyShort>No workloads are currently affected by this vulnerability.</BodyShort>
				{/if}
			{:else if $TeamCVEWorkloads.errors}
				<GraphErrors errors={$TeamCVEWorkloads.errors} />
			{/if}
			{#if hasNextPage}
				<div class="load-more">
					<Button variant="secondary" size="small" onclick={loadMore} loading={loadingMore}>
						Load more
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if viewerIsMember && $TeamCVEPage.data}
	<BulkSuppressCVE
		bind:open={bulkOpen}
		cveIdentifier={$TeamCVEPage.data.cve.identifier}
		workloads={bulkWorkloads}
		onsuppressed={onSuppressed}
	/>
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-32);
	}

	.fix-version-term {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.load-more {
		display: flex;
		justify-content: center;
		margin-top: var(--ax-space-16);
	}

	.search-form {
		display: flex;
		gap: var(--ax-space-12);
		align-items: flex-end;
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
		height: 300px;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.risk-assessment-content {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: end;
		gap: var(--ax-space-24);
	}

	.risk-assessment-card {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		padding: var(--ax-space-16);
		border: var(--ax-space-1) solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-8);
		background: var(--ax-bg-neutral-soft);
	}

	.risk-assessment-group,
	.risk-assessment-signals {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.risk-assessment-signals :global(ul.signals) {
		flex-wrap: nowrap;
	}

	.risk-assessment-values {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ax-space-8);
	}

	@media (max-width: 767px) {
		.risk-assessment-signals :global(ul.signals) {
			flex-wrap: wrap;
		}
	}

	.vulnerability-type,
	.vulnerability-description {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.risk-assessment-content :global(dd) {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.cve-description {
		max-width: 80ch;
		line-height: var(--ax-font-line-height-large);
	}

	@media (max-width: 767px) {
		.risk-assessment-content {
			grid-template-columns: 1fr;
		}
	}

	.workloads-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-12);
		flex-wrap: wrap;
		margin-bottom: var(--ax-space-8);
	}

	.select-all-row {
		margin-bottom: var(--ax-space-8);
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
		grid-template-columns: minmax(0, 1fr) minmax(0, 4fr);
		gap: var(--ax-space-24);
		align-items: start;
	}

	.workload-identity {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		min-width: 0;
	}

	.workload-details {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-8) var(--ax-space-12);
		margin: 0;
		padding-left: var(--ax-space-12);
		border-left: var(--ax-space-2) solid var(--ax-border-subtle);
	}

	.detail-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: 1 / -1;
		align-items: baseline;
	}

	@media (max-width: 767px) {
		.workload-container {
			grid-template-columns: 1fr;
		}

		.workload-details {
			grid-template-columns: 1fr;
			padding-left: 0;
			border-left: none;
			gap: var(--ax-space-8);
		}

		.detail-row {
			gap: var(--ax-space-4);
		}
	}

	@container (max-width: 500px) {
		.workload-container {
			grid-template-columns: 1fr;
		}

		.workload-details {
			grid-template-columns: 1fr;
			padding-left: 0;
			border-left: none;
			gap: var(--ax-space-8);
		}

		.detail-row {
			gap: var(--ax-space-4);
		}
	}

	code {
		font-size: var(--ax-font-size-small);
		word-break: break-all;
	}
</style>
