<script lang="ts">
	import { goto } from '$app/navigation';
	import { graphql } from '$houdini';
	import BulkSuppressCVE, {
		type BulkSuppressWorkload
	} from '$lib/domain/vulnerability/BulkSuppressCVE.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { suppressionStateLabels } from '$lib/utils/vulnerabilities';
	import {
		Alert,
		BodyShort,
		Button,
		Checkbox,
		Detail,
		Heading,
		Loader,
		Search
	} from '@nais/ds-svelte-community';
	import { MagnifyingGlassIcon } from '@nais/ds-svelte-community/icons';
	import { SvelteSet } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CVEDetails, CVEWorkloads, teamSlug } = $derived(data);

	let searchValue = $state('');
	let selectedIds = new SvelteSet<string>();
	let bulkOpen = $state(false);

	const teamRoles = graphql(`
		query CVEPageTeamRoles($team: Slug!) @cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				viewerIsMember
			}
		}
	`);

	$effect(() => {
		if (teamSlug) {
			teamRoles.fetch({ variables: { team: teamSlug } });
		}
	});

	const viewerIsMember = $derived(
		teamSlug ? ($teamRoles.data?.team.viewerIsMember ?? false) : false
	);

	const handleSearch = async (event: SubmitEvent) => {
		event.preventDefault();
		const identifier = searchValue.trim();
		if (identifier) {
			searchValue = '';
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

	const toggleSelect = (id: string) => {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
	};

	const toggleAll = (nodes: { vulnerability: { id: string } }[]) => {
		if (allSelected(nodes)) {
			selectedIds.clear();
		} else {
			nodes.forEach((n) => selectedIds.add(n.vulnerability.id));
		}
	};

	const allSelected = (nodes: { vulnerability: { id: string } }[]) => {
		return nodes.length > 0 && nodes.every((n) => selectedIds.has(n.vulnerability.id));
	};

	const bulkWorkloads = $derived.by((): BulkSuppressWorkload[] => {
		const nodes = $CVEWorkloads.data?.cve.workloads.nodes ?? [];
		return nodes
			.filter((n) => selectedIds.has(n.vulnerability.id))
			.map((n) => ({
				vulnerabilityId: n.vulnerability.id,
				workloadName: n.workload.name,
				teamSlug: n.workload.team.slug,
				environmentName: n.workload.teamEnvironment.environment.name,
				package: n.vulnerability.package
			}));
	});

	const onSuppressed = () => {
		selectedIds.clear();
		CVEWorkloads.fetch({ policy: 'NetworkOnly' });
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
			{@const cve = $CVEDetails.data.cve}
			<div class="wrapper">
				<div class="header">
					<div class="title-row">
						<Heading as="h1" size="large">{cve.identifier}</Heading>
						<span class="severity-badge {cve.severity}">{cve.severity}</span>
					</div>
					{#if cve.title}
						<Detail>{cve.title}</Detail>
					{/if}
				</div>

				<div class="card">
					<Heading as="h2" size="small" spacing>Details</Heading>
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
								<span
									class="severity-badge {cve.severity}"
									style="font-size: var(--ax-font-size-small)">{cve.severity}</span
								>
							</BodyShort>
						</div>
						<div>
							<Detail as="dt">More Information</Detail>
							<BodyShort as="dd">
								{#if hasDetailsLink(cve.detailsLink)}
									<ExternalLink href={cve.detailsLink}>View full details</ExternalLink>
								{:else}
									No link available
								{/if}
							</BodyShort>
						</div>
					</dl>
				</div>
			</div>
		{:else if hasOtherErrors($CVEDetails.errors)}
			<GraphErrors errors={$CVEDetails.errors} />
		{/if}

		{#if !isNotFoundError($CVEWorkloads.errors)}
			<div>
				<div class="workloads-header">
					<Heading as="h2" size="small" spacing>
						Affected Workloads
						{#if $CVEWorkloads.data?.cve.workloads.pageInfo.totalCount ?? 0 > 0}
							<span class="count">({$CVEWorkloads.data?.cve.workloads.pageInfo.totalCount})</span>
						{/if}
						{#if teamSlug && $teamRoles.data?.team}
							<Tag variant="neutral" size="small">Filtered: {teamSlug}</Tag>
						{/if}
					</Heading>
					{#if teamSlug && $teamRoles.data?.team && viewerIsMember && bulkWorkloads.length > 0}
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

				{#if $CVEWorkloads.fetching}
					<div class="loading" role="status" aria-label="Loading">
						<Loader size="3xlarge" />
					</div>
				{:else if $CVEWorkloads.data}
					{@const workloads = $CVEWorkloads.data.cve.workloads}
					{#if workloads.nodes.length > 0}
						{#if teamSlug && viewerIsMember}
							<div class="select-all-row">
								<Checkbox
									checked={allSelected(workloads.nodes)}
									indeterminate={selectedIds.size > 0 && !allSelected(workloads.nodes)}
									onchange={() => toggleAll(workloads.nodes)}
								>
									Select all on this page
								</Checkbox>
							</div>
						{/if}
						<List>
							{#each workloads.nodes as node ([node.workload.name, node.workload.team.slug, node.workload.teamEnvironment.environment.name, node.vulnerability.package].join('|'))}
								{@const workload = node.workload}
								{@const vuln = node.vulnerability}
								<ListItem>
									<div class="workload-row">
										{#if teamSlug && viewerIsMember}
											<Checkbox
												checked={selectedIds.has(vuln.id)}
												onchange={() => toggleSelect(vuln.id)}
												hideLabel>Select {workload.name}</Checkbox
											>
										{/if}
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
				{:else if hasOtherErrors($CVEWorkloads.errors)}
					<GraphErrors errors={$CVEWorkloads.errors} />
				{/if}
			</div>
		{/if}
	</div>
</div>

{#if teamSlug && viewerIsMember && $CVEDetails.data}
	<BulkSuppressCVE
		bind:open={bulkOpen}
		cveIdentifier={$CVEDetails.data.cve.identifier}
		workloads={bulkWorkloads}
		onsuppressed={onSuppressed}
	/>
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		margin-top: var(--spacing-layout);
		gap: var(--spacing-layout);
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

	.count {
		font-weight: normal;
		color: var(--ax-text-neutral);
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

	.workload-row {
		display: flex;
		align-items: flex-start;
		gap: var(--ax-space-12);
	}

	.workload-container {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(200px, 300px) 1fr;
		gap: var(--ax-space-24);
		align-items: start;
	}

	@media (max-width: 767px) {
		.workload-container {
			grid-template-columns: 1fr;
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
