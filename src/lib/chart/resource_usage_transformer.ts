import type { ResourceUtilizationForApp$result } from '$houdini';
import type { EChartsOption } from 'echarts';
import prettyBytes from 'pretty-bytes';

export function resourceUsageMemoryTransformLineChart(
	input: ResourceUtilizationForApp$result['memory']
): EChartsOption {
	const dates = new Array<Date>();
	for (let i = 0; i < input.length; i++) {
		dates.push(input[i].timestamp);
	}

	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'line'
			},
			valueFormatter: prettyBytes
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: dates.map(
				(date) => {
					return date.toLocaleDateString('en-GB', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					});
				}
				//
			)
		},
		yAxis: {
			type: 'value',
			name: 'Memory',
			axisLabel: {
				formatter: (value: number) => prettyBytes(value)
			}
		},
		series: [
			{
				type: 'line',
				name: 'Memory request',
				data: input.map((s) => {
					return s.request;
				}),
				showSymbol: false
			},
			{
				type: 'line',
				name: 'Memory usage',
				data: input.map((s) => {
					return s.usage;
				}),
				showSymbol: false
			}
		]
	} as EChartsOption;
}

export function resourceUsageCPUTransformLineChart(
	input: ResourceUtilizationForApp$result['cpu']
): EChartsOption {
	const dates = new Array<Date>();
	for (let i = 0; i < input.length; i++) {
		dates.push(input[i].timestamp);
	}

	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'line'
			}
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: dates.map(
				(date) => {
					return date.toLocaleTimeString('en-GB', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					});
				}
				//
			)
		},
		yAxis: {
			type: 'value',
			name: 'CPU Cores'
		},
		series: [
			{
				type: 'line',
				name: 'Requested cores',
				data: input.map((s) => {
					return s.request;
				}),
				showSymbol: false
			},
			{
				type: 'line',
				name: 'Used cores',
				data: input.map((s) => {
					return s.usage;
				}),
				showSymbol: false
			}
		]
	} as EChartsOption;
}
