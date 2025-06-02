<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { TeamOrderField, type TeamOrderField$options } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import { transformVulnerabilities } from '$lib/chart/transformVulnerabilities';
	import { truncateString } from '$lib/chart/util';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
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
	} from '@nais/ds-svelte-community';
	import type { EChartsOption } from 'echarts';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites } = $derived(data);
	let riskScoreToggle = $state('off');
	let showByToggle = $state() as TeamOrderField$options;
	showByToggle =
		$TenantVulnerabilites.variables?.mostVulnerableTeamsField || TeamOrderField.RISK_SCORE;

	let options = $derived(
		transformVulnerabilities(
			$TenantVulnerabilites.data?.imageVulnerabilityHistory,
			riskScoreToggle === 'on'
		)
	);

	type VulnerabilityTeams =
		| {
				nodes: {
					slug: string;
					vulnerabilitySummary: {
						riskScore: number;
						critical: number;
						high: number;
						medium: number;
						low: number;
						unassigned: number;
						coverage: number;
					};
					workloads: {
						pageInfo: {
							totalCount: number;
						};
					};
				}[];
		  }
		| undefined
		| null;

	let mostVulnerable = $derived.by(() =>
		optionsMostVulnerable($TenantVulnerabilites.data?.mostVulnerableTeams, showByToggle)
	);

	function optionsMostVulnerable(
		input: VulnerabilityTeams,
		showByToggle: TeamOrderField$options
	): EChartsOption {
		if (!input || input.nodes.length === 0) {
			return {} as EChartsOption;
		}

		const seriesData = input.nodes.map((s) =>
			showByToggle === TeamOrderField.RISK_SCORE
				? s.vulnerabilitySummary.riskScore
				: showByToggle === TeamOrderField.CRITICAL_VULNERABILITIES
					? s.vulnerabilitySummary.critical
					: showByToggle === TeamOrderField.SBOM_COVERAGE
						? s.workloads.pageInfo.totalCount > 0
							? s.vulnerabilitySummary.coverage
							: null
						: s.vulnerabilitySummary.riskScore
		);

		return {
			height: '500px',
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line'
				},
				formatter: (params: CallbackDataParams[]) => {
					const items = params.map((p) => {
						return `
						<div>
							<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background:#ff4500;"></span>
							${p.seriesName}: ${p.value}
						</div>
					`;
					});
					return `${params[0].value}<br/>${items.join('')}`;
				}
			},
			xAxis: {
				type: 'category',
				data: input.nodes.map((s) => s.slug),
				axisLabel: {
					rotate: 60,
					formatter: (value: string) => truncateString(value, 23)
				}
			},
			legend: {
				show: false
			},
			yAxis: {
				type: 'value',
				name:
					showByToggle === TeamOrderField.RISK_SCORE
						? 'Risk Score'
						: showByToggle === TeamOrderField.CRITICAL_VULNERABILITIES
							? 'Critical Vulnerabilities'
							: showByToggle === TeamOrderField.SBOM_COVERAGE
								? 'SBOM Coverage'
								: 'Risk Score'
			},
			series: {
				name:
					showByToggle === TeamOrderField.RISK_SCORE
						? 'Risk Score'
						: showByToggle === TeamOrderField.CRITICAL_VULNERABILITIES
							? 'Critical Vulnerabilities'
							: showByToggle === TeamOrderField.SBOM_COVERAGE
								? 'SBOM Coverage'
								: 'Risk Score',
				type: 'bar',
				data: seriesData,
				color: '#ff4500', // Tooltip marker color (e.g. solid orange-red)
				itemStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: '#ff0000' }, // Red at top
							{ offset: 1, color: '#ffa500' } // Orange at bottom
						]
					}
				}
			}
		} as EChartsOption;
	}

	let tableSort = $derived({
		orderBy: $TenantVulnerabilites.variables?.orderBy?.field,
		direction: $TenantVulnerabilites.variables?.orderBy?.direction
	});

	let interval = $derived.by(() => {
		const val = page.url.searchParams.get('interval');
		if (val && ['6m', '30d', '7d'].includes(val)) return val;
		return '7d';
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = TeamOrderField[key as keyof typeof TeamOrderField];
			tableSort.direction = 'DESC';
		}

		changeParams(
			{
				direction: tableSort.direction,
				field: tableSort.orderBy || TeamOrderField.SLUG,
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	};
	function handleChartClick(name: string) {
		goto(`/team/${name}/vulnerabilities`);
	}
</script>

<div class="container">
	<div class="wrapper">
		<GraphErrors errors={$TenantVulnerabilites.errors} />

		<div class="graph">
			<div class="heading">
				<div class="content">
					<Heading level="2" spacing
						>Vulnerabilities for <strong>{page.data.tenantName?.toUpperCase()}</strong></Heading
					>
					<BodyLong>
						This stacked line chart displays the accumulation of image vulnerabilities over time,
						categorized by severity level. Use the interval selector to adjust the time range.
						Enable the Risk Score toggle to weight each severity by its impact.
					</BodyLong>
				</div>
			</div>
			{#if !$TenantVulnerabilites.fetching && $TenantVulnerabilites.data}
				<div class="toggles">
					<ToggleGroup
						label="Interval"
						value={interval}
						onchange={(interval) => changeParams({ interval }, { noScroll: true })}
					>
						{#each ['6m', '30d', '7d'] as interval (interval)}
							<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
						{/each}
					</ToggleGroup>
					<ToggleGroup
						label="Risk score"
						value={riskScoreToggle}
						onchange={(val) => (riskScoreToggle = val)}
					>
						<ToggleGroupItem value="off">Off</ToggleGroupItem>
						<ToggleGroupItem value="on">On</ToggleGroupItem>
					</ToggleGroup>
				</div>
				<EChart {options} style="height: 500px" />
				<div>
					<Heading level="3" spacing
						>Most Vulnerable Teams - {showByToggle === TeamOrderField.RISK_SCORE
							? 'Highest Vulnerability Risk Score'
							: showByToggle === TeamOrderField.CRITICAL_VULNERABILITIES
								? 'Most Critical Vulnerabilities'
								: showByToggle === TeamOrderField.SBOM_COVERAGE
									? 'Lowest SBOM Coverage'
									: 'Should not print'}
					</Heading>
					<div class="toggles">
						<ToggleGroup
							label="Show by"
							value={showByToggle.toString()}
							onchange={(val) => {
								showByToggle = val as TeamOrderField$options;
								changeParams({ showByToggle }, { noScroll: true });
							}}
						>
							<ToggleGroupItem value={TeamOrderField.RISK_SCORE}>Risk Score</ToggleGroupItem>
							<ToggleGroupItem value={TeamOrderField.CRITICAL_VULNERABILITIES}
								>Critical Vulnerabilities</ToggleGroupItem
							>
							<ToggleGroupItem value={TeamOrderField.SBOM_COVERAGE}>SBOM Coverage</ToggleGroupItem>
						</ToggleGroup>
					</div>

					<EChart options={mostVulnerable} style="height: 700px" onclick={handleChartClick} />
				</div>
			{:else}
				<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
					<Loader size="3xlarge" />
				</div>
			{/if}
		</div>

		<div>
			<Table
				size="small"
				sort={{
					orderBy: tableSort.orderBy || TeamOrderField.SLUG,
					direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
				}}
				onsortchange={tableSortChange}
			>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey={TeamOrderField.SLUG}>Team</Th>
						<Th sortable={true} sortKey={TeamOrderField.CRITICAL_VULNERABILITIES}>Critical</Th>
						<Th sortable={true} sortKey={TeamOrderField.HIGH_VULNERABILITIES}>High</Th>
						<Th sortable={true} sortKey={TeamOrderField.MEDIUM_VULNERABILITIES}>Medium</Th>
						<Th sortable={true} sortKey={TeamOrderField.LOW_VULNERABILITIES}>Low</Th>
						<Th sortable={true} sortKey={TeamOrderField.UNASSIGNED_VULNERABILITIES}>Unassgined</Th>
						<Th sortable={true} sortKey={TeamOrderField.RISK_SCORE}>Risk Score</Th>
						<Th sortable={true} sortKey={TeamOrderField.SBOM_COVERAGE}>Coverage</Th>
						<Th># of Workloads</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each $TenantVulnerabilites.data?.teams.nodes ?? [] as team (team.slug)}
						<Tr>
							<Td><a href="/team/{team.slug}/vulnerabilities">{team.slug}</a></Td>
							<Td style="text-align: right">{team.vulnerabilitySummary.critical}</Td>
							<Td style="text-align: right">{team.vulnerabilitySummary.high}</Td>
							<Td style="text-align: right">{team.vulnerabilitySummary.medium}</Td>
							<Td style="text-align: right">{team.vulnerabilitySummary.low}</Td>
							<Td style="text-align: right">{team.vulnerabilitySummary.unassigned}</Td>
							<Td style="text-align: right">{team.vulnerabilitySummary.riskScore}</Td>
							<Td style="text-align: right"
								>{team.vulnerabilitySummary.coverage.toLocaleString('en-GB', {
									minimumFractionDigits: 0,
									maximumFractionDigits: 0
								})}%</Td
							>
							<Td style="text-align: right">{team.workloads.pageInfo.totalCount}</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
			{#if $TenantVulnerabilites.data?.teams.pageInfo.hasPreviousPage || $TenantVulnerabilites.data?.teams.pageInfo.hasNextPage}
				<Pagination
					page={$TenantVulnerabilites.data?.teams.pageInfo}
					loaders={{
						loadPreviousPage: () =>
							changeParams({
								after: '',
								before: $TenantVulnerabilites.data?.teams.pageInfo.startCursor ?? ''
							}),
						loadNextPage: () =>
							changeParams({
								after: $TenantVulnerabilites.data?.teams.pageInfo.endCursor ?? '',
								before: ''
							})
					}}
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.graph {
		display: flex;
		flex-direction: column;
	}

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--spacing-layout);
		padding-bottom: var(--spacing-layout);
	}

	.content {
		max-width: 80ch;
	}
	.toggles {
		display: flex;
		gap: var(--spacing-layout);
		flex-direction: row;
		justify-content: flex-end;
	}
</style>
