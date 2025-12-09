<script lang="ts">
	import { goto } from '$app/navigation';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { severityToColor, suppressionStateLabels } from '$lib/utils/vulnerabilities';
	import {
		Alert,
		BodyShort,
		Button,
		Detail,
		Heading,
		Loader,
		ReadMore,
		Search,
		Tag
	} from '@nais/ds-svelte-community';
	import { MagnifyingGlassIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CVEDetails, CVEWorkloads } = $derived(data);

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
			<div class="loading">
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
			</div>
		{:else if hasOtherErrors($CVEDetails.errors)}
			<GraphErrors errors={$CVEDetails.errors} />
		{/if}
		<Heading level="2" size="small">
			Affected Workloads
			{#if $CVEWorkloads.data?.cve.workloads.pageInfo.totalCount ?? 0 > 0}
				<span class="count">({$CVEWorkloads.data?.cve.workloads.pageInfo.totalCount})</span>
			{/if}
		</Heading>
		{#if $CVEWorkloads.fetching}
			<div class="loading">
				<Loader size="3xlarge" />
			</div>
		{:else if isNotFoundError($CVEWorkloads.errors)}
			<Alert variant="warning" size="medium" style="margin-bottom: 1rem;">
				Vulnerability not found. The ID you entered doesn't exist in our database.
			</Alert>
		{:else if $CVEWorkloads.data}
			{@const workloads = $CVEWorkloads.data.cve.workloads}
			{#if workloads.nodes.length > 0}
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
												<code>{suppressionStateLabels[vuln.suppression.state] ?? 'Unknown'}</code>
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
		{:else if hasOtherErrors($CVEWorkloads.errors)}
			<GraphErrors errors={$CVEWorkloads.errors} />
		{/if}
	</div>
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);
	}

	.search-form {
		display: flex;
		gap: var(--ax-space-12);
		align-items: flex-end;
		margin-bottom: var(--ax-space-16);
		max-width: 600px;
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
