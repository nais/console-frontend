<script lang="ts">
	import { page } from '$app/state';
	import type { TenantVulnerabilites$result } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import {
		BodyLong,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import type { EChartsOption } from 'echarts';
	import type { OptionDataValue } from 'echarts/types/src/util/types.js';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites, interval } = $derived(data);
	let riskScoreArea = $state('off');

	const vulnerabilitiesTransformStackedLineChart = (
		data: TenantVulnerabilites$result
	): EChartsOption => {
		if (data.imageVulnerabilityHistory.samples.length === 0) {
			return {
				animation: false,
				title: {
					text: 'No data',
					left: 'center',
					top: 'center',
					textStyle: {
						color: '#aaa'
					}
				}
			} as EChartsOption;
		}

		const dates: string[] = [];
		const seriesData: { [criticality: string]: [Date, number][] } = {};
		const allSeverities: Severity[] = ['critical', 'high', 'medium', 'low', 'unassigned'];

		// Second pass to build the series data
		type Severity = 'critical' | 'high' | 'medium' | 'low' | 'unassigned' | 'riskScore' | 'total';

		data.imageVulnerabilityHistory.samples.forEach((entry) => {
			const entryDate = new Date(entry.date);

			dates.push(entryDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD

			(Object.keys(entry.summary) as Severity[]).forEach((criticality) => {
				if (!seriesData[criticality]) {
					seriesData[criticality] = [];
				}
				seriesData[criticality].push([entryDate, entry.summary[criticality]]);
			});
		});

		// Prepare the series for ECharts
		const series = allSeverities
			.map((severity) => ({
				name: severity,
				type: 'line',
				stack: 'Cost',
				areaStyle: {
					opacity: 1
				},
				showSymbol: false,
				color: severityToColor({ severity, isGraph: true }),
				data: seriesData[severity]
			}))
			.sort((a, b) => {
				return (
					allSeverities.indexOf(b.name as Severity) - allSeverities.indexOf(a.name as Severity)
				);
			});

		// Return the ECharts option object
		return {
			animation: false,
			title:
				series.length === 0
					? {
							text: 'No data',
							left: 'center',
							top: 'center',
							textStyle: {
								color: '#aaa'
							}
						}
					: {},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				valueFormatter(value: OptionDataValue[]) {
					return value[1];
				}
			},
			// emphasis: {
			// 	focus: 'series'
			// },
			legend: {
				selector: [{ title: 'Inverse selection', type: 'inverse' }],
				data: Array.from(allSeverities)
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: [
				{
					type: 'time',
					boundaryGap: false
				}
			],
			yAxis: [
				{
					type: 'value',
					name: '# of vulnerabilities'
				}
			],
			series
		} as EChartsOption;
	};

	const riskScoreTransformStackedLineChart = (data: TenantVulnerabilites$result): EChartsOption => {
		if (data.imageVulnerabilityHistory.samples.length === 0) {
			return {
				animation: false,
				title: {
					text: 'No data',
					left: 'center',
					top: 'center',
					textStyle: {
						color: '#aaa'
					}
				}
			} as EChartsOption;
		}

		const dates: string[] = [];
		const seriesData: { [criticality: string]: [Date, number][] } = {};
		const allSeverities: Severity[] = ['critical', 'high', 'medium', 'low', 'unassigned'];
		const sevirityToRiskScore: { Severity: string; value: number }[] = [
			{ Severity: 'critical', value: 10 },
			{ Severity: 'high', value: 5 },
			{ Severity: 'medium', value: 3 },
			{ Severity: 'low', value: 1 },
			{ Severity: 'unassigned', value: 5 }
		];

		// Second pass to build the series data
		type Severity = 'critical' | 'high' | 'medium' | 'low' | 'unassigned' | 'riskScore' | 'total';

		data.imageVulnerabilityHistory.samples.forEach((entry) => {
			const entryDate = new Date(entry.date);

			dates.push(entryDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD

			(Object.keys(entry.summary) as Severity[]).forEach((criticality) => {
				if (!seriesData[criticality]) {
					seriesData[criticality] = [];
				}
				seriesData[criticality].push([
					entryDate,
					entry.summary[criticality] *
						(sevirityToRiskScore.find((s) => s.Severity === criticality)?.value ?? 1)
				]);
			});
		});

		// Prepare the series for ECharts
		const series = allSeverities
			.map((severity) => ({
				name: severity,
				type: 'line',
				stack: 'Cost',
				areaStyle: {
					opacity: 1
				},
				showSymbol: false,
				color: severityToColor({ severity, isGraph: true }),
				data: seriesData[severity]
			}))
			.sort((a, b) => {
				return (
					allSeverities.indexOf(b.name as Severity) - allSeverities.indexOf(a.name as Severity)
				);
			});

		// Return the ECharts option object
		return {
			animation: false,
			title:
				series.length === 0
					? {
							text: 'No data',
							left: 'center',
							top: 'center',
							textStyle: {
								color: '#aaa'
							}
						}
					: {},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				valueFormatter(value: OptionDataValue[]) {
					return value[1];
				}
			},
			// emphasis: {
			// 	focus: 'series'
			// },
			legend: {
				selector: [{ title: 'Inverse selection', type: 'inverse' }],
				data: Array.from(allSeverities)
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: [
				{
					type: 'time',
					boundaryGap: false
				}
			],
			yAxis: [
				{
					type: 'value',
					name: '# of vulnerabilities'
				}
			],
			series
		} as EChartsOption;
	};
</script>

<div class="container">
	<div class="wrapper">
		<GraphErrors errors={$TenantVulnerabilites.errors} />

		<div class="graph">
			<div class="heading">
				<div class="content">
					{riskScoreArea}
					<Heading level="2" spacing
						>Vulnerabilities for <strong>{page.data.tenantName?.toUpperCase()}</strong></Heading
					>
					<BodyLong>
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Perferendis est ipsam ipsum
						qui necessitatibus quisquam accusamus alias dolores voluptates fugit, molestias atque
						consequatur, itaque esse! Ea suscipit porro autem tempora.
					</BodyLong>
				</div>
				<ToggleGroup
					value={interval}
					onchange={(interval) => changeParams({ interval }, { noScroll: true })}
				>
					{#each ['1y', '6m', '30d', '7d'] as interval (interval)}
						<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
					{/each}
				</ToggleGroup>
				<ToggleGroup value={riskScoreArea} onchange={(val) => (riskScoreArea = val)}>
					<ToggleGroupItem value="off">Off</ToggleGroupItem>
					<ToggleGroupItem value="on">On</ToggleGroupItem>
				</ToggleGroup>
			</div>
			{#if $TenantVulnerabilites.data}
				{#if riskScoreArea === 'on'}
					<EChart
						options={riskScoreTransformStackedLineChart($TenantVulnerabilites.data)}
						style="height: 500px"
					/>
				{:else}
					<EChart
						options={vulnerabilitiesTransformStackedLineChart($TenantVulnerabilites.data)}
						style="height: 500px"
					/>
				{/if}
			{:else}
				<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
					<Loader size="3xlarge" />
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.graph {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16, --a-spacing-4);
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
</style>
