<script lang="ts">
	import type { TenantVulnerabilites$result } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import { Loader } from '@nais/ds-svelte-community';
	import type { EChartsOption } from 'echarts';
	import type { OptionDataValue } from 'echarts/types/src/util/types.js';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites } = $derived(data);
	const vulnerabilitiesTransformStackedColumnChart = (
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
</script>

<div>
	{#if $TenantVulnerabilites.data}
		<EChart
			options={vulnerabilitiesTransformStackedColumnChart($TenantVulnerabilites.data)}
			style="height: 500px"
		/>
	{:else}
		<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
			<Loader size="3xlarge" />
		</div>
	{/if}
</div>
