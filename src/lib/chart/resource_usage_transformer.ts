import type { AppResourceUtilization$result } from '$houdini';
import type { EChartsOption } from 'echarts';
import prettyBytes from 'pretty-bytes';

export function resourceUsageMemTransformStackedColumnChart(
	input: AppResourceUtilization$result['memoryUtilizationForApp']
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
				})
			},
			{
				type: 'line',
				name: 'Memory usage',
				data: input.map((s) => {
					return s.usage;
				})
			}
		]
	} as EChartsOption;
}

export function resourceUsageCPUTransformStackedColumnChart(
	input: AppResourceUtilization$result['CPUUtilizationForApp']
): EChartsOption {
	const dates = new Array<Date>();
	for (let i = 0; i < input.length; i++) {
		dates.push(input[i].timestamp);
	}

	return {
		xAxis: {
			type: 'category',
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
				})
			},
			{
				type: 'line',
				name: 'Used cores',
				data: input.map((s) => {
					return s.usage;
				})
			}
		]
	} as EChartsOption;
}
