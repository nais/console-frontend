<script lang="ts">
	import { navigating } from '$app/state';
	import { PrometheusChartQueryInterval } from '#lib/chart/util.js';
	import { queryDuration, queryInsightsResult } from '#lib/domain/postgres/queryInsights.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import {
		Alert,
		BodyShort,
		Heading,
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleGroup,
		ToggleGroupItem,
		Tr
	} from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresInsights, PostgresQueryStatistics, branch, interval } = $derived(data);
	let selectedInterval = $derived(interval);
	let postgres = $derived($PostgresInsights.data?.team.environment.postgres);
	let metrics = $derived($PostgresQueryStatistics.data?.environment.metrics);
	let result = $derived(queryInsightsResult(metrics?.series ?? []));
	let hasErrors = $derived(
		!!$PostgresInsights.errors?.length || !!$PostgresQueryStatistics.errors?.length
	);
	let loading = $derived(
		!!navigating.to ||
			(!hasErrors &&
				($PostgresInsights.fetching ||
					(!!postgres && !!branch && $PostgresQueryStatistics.fetching)))
	);
	const uid = $props.id();
</script>

<GraphErrors errors={$PostgresInsights.errors} />
<GraphErrors errors={$PostgresQueryStatistics.errors} />

{#if postgres}
	<div class="query-controls">
		<ToggleGroup
			label="Time period"
			size="small"
			bind:value={selectedInterval}
			onchange={() => changeParams({ interval: selectedInterval, database: '' })}
		>
			{#each Object.values(PrometheusChartQueryInterval) as option (option)}
				<ToggleGroupItem value={option}>{option}</ToggleGroupItem>
			{/each}
		</ToggleGroup>
	</div>
{/if}

<section aria-labelledby={`${uid}-heading`} aria-busy={loading}>
	<Heading as="h2" size="medium" spacing id={`${uid}-heading`}>Query statistics</Heading>
	{#if loading}
		<div class="loading-centered" role="status" aria-label="Loading query statistics">
			<Loader size="3xlarge" />
		</div>
	{:else if hasErrors}
		<BodyShort>Query statistics could not be loaded.</BodyShort>
	{:else if !postgres || !branch}
		<BodyShort>Query statistics are not yet available for this Postgres.</BodyShort>
	{:else if result.error}
		<Alert variant="error">{result.error}</Alert>
	{:else if !metrics}
		<Alert variant="error">Query statistics could not be loaded.</Alert>
	{:else}
		{#each metrics.warnings as warning (warning)}
			<Alert variant="warning">{warning}</Alert>
		{/each}
		{#if !result.available}
			<Alert variant="info">
				Query statistics are not currently exported for the app database. Check that
				pg_stat_statements metrics are enabled.
			</Alert>
		{:else}
			<BodyShort spacing>
				Top 20 queries in the app database, sorted by total execution time (highest first) during
				the last {interval}, across Postgres instances. Each database user is listed separately.
				Values are estimates from Prometheus counter increases; gaps, statistics resets and evicted
				queries can limit coverage. Exported SQL text is limited to 256 characters.
			</BodyShort>
			<BodyShort spacing>Evaluated at <Time time={data.collectedAt} dateFormat="PPpp" />.</BodyShort
			>
			{#if result.rows.length === 0}
				<BodyShort>No query activity could be calculated for the selected period.</BodyShort>
			{:else}
				{#if result.rows.some((row) => row.calls === null || row.meanSeconds === null || row.share === null)}
					<Alert variant="warning">
						Some statistics are unavailable. Missing values are shown as N/A.
					</Alert>
				{/if}
				{#if result.rows.some((row) => row.queryTexts.length === 0)}
					<Alert variant="info">
						SQL text is unavailable for some queries. Their metadata may no longer be exported.
					</Alert>
				{/if}
				<div class="table-scroll">
					<Table size="small" aria-labelledby={`${uid}-heading`}>
						<Thead>
							<Tr>
								<Th scope="col">Query</Th>
								<Th scope="col">User</Th>
								<Th scope="col">Total execution time</Th>
								<Th scope="col">Calls (estimated)</Th>
								<Th scope="col">Mean execution time</Th>
								<Th scope="col">Share of execution time</Th>
							</Tr>
						</Thead>
						<Tbody>
							{#each result.rows as row (row.key)}
								<Tr>
									<Td>
										{#if row.queryTexts.length > 0}
											<div class="query-texts">
												{#if row.queryTexts.length > 1}
													<BodyShort size="small">SQL variants</BodyShort>
												{/if}
												{#each row.queryTexts as query (query)}
													<code>{query}</code>
												{/each}
											</div>
										{:else}
											<BodyShort size="small">SQL text unavailable</BodyShort>
										{/if}
									</Td>
									<Td>{row.user}</Td>
									<Td>{queryDuration(row.seconds)}</Td>
									<Td>
										{row.calls === null
											? 'N/A'
											: row.calls.toLocaleString('en-GB', { maximumFractionDigits: 1 })}
									</Td>
									<Td>{row.meanSeconds === null ? 'N/A' : queryDuration(row.meanSeconds)}</Td>
									<Td>{row.share === null ? 'N/A' : `${(row.share * 100).toFixed(1)}%`}</Td>
								</Tr>
							{/each}
						</Tbody>
					</Table>
				</div>
			{/if}
		{/if}
	{/if}
</section>

<style>
	.query-controls {
		display: flex;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: var(--ax-space-16);
		margin-bottom: var(--ax-space-24);
	}
	.query-texts {
		display: grid;
		gap: var(--ax-space-8);
	}
	code {
		display: block;
		max-width: 60ch;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
</style>
