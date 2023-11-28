import type { EChartsOption } from 'echarts';
import type { ResourceUtilizationApp } from './types';

export function resourceUsagePercentageTransformLineChart(
	input: ResourceUtilizationApp
): EChartsOption {
	const dates = new Array<Date>();
	for (let i = 0; i < input.cpu.length; i++) {
		dates.push(new Date(input.cpu[i].timestamp));
	}

	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'line'
			},
			valueFormatter: (value: number) =>
				value == null ? '-' : value.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + '%'
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
			name: 'Usage of requested resources',
			axisLabel: {
				formatter: (value: number) =>
					value.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + '%'
			},
			scale: false
		},
		series: [
			{
				type: 'line',
				name: 'Memory usage',
				data: input.memory.map((s) => {
					return s.utilization > 0.0 ? s.utilization : undefined;
				}),
				showSymbol: false,
				color: '#41bc25'
			},
			{
				type: 'line',
				name: 'CPU usage',
				data: input.cpu.map((s) => {
					return s.utilization > 0.0 ? s.utilization : undefined;
				}),
				showSymbol: false,
				color: '#2378f7'
			}
		]
	} as EChartsOption;
}
