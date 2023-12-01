import { graphic, type EChartsOption } from 'echarts';
import prettyBytes from 'pretty-bytes';
import type { Overage, Utilization } from './types';
import { truncateString } from './util';

export function resourceUsageTeamTransformLineChart(input: Utilization): EChartsOption {
	const dates = new Array<Date>();
	for (let i = 0; i < input.cpu.length; i++) {
		dates.push(new Date(input.cpu[i].timestamp));
	}

	if (
		input.memory[input.memory.length - 1].utilization === 0.0 &&
		input.cpu[input.cpu.length - 1].utilization === 0.0
	) {
		dates.pop();
		input.memory.pop();
		input.cpu.pop();
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
			data: dates.map((date) => {
				return date.toLocaleDateString('en-GB', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});
			})
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				formatter: (value: number) =>
					value.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + '%'
			}
		},
		series: [
			{
				type: 'line',
				name: 'CPU',
				data: input.cpu.map((s) => {
					if (s.utilization === 0) {
						return null;
					}
					return s.utilization;
				}),
				showSymbol: false,
				color: '#2378f7'
			},
			{
				type: 'line',
				name: 'Memory',
				data: input.memory.map((s) => {
					if (s.utilization === 0) {
						return null;
					}
					return s.utilization;
				}),
				showSymbol: false,
				color: '#41bc25'
			}
		]
	} as EChartsOption;
}

export function resourceUtilizationCPUOverageTransformLineChart(input: Overage[]): EChartsOption {
	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'line'
			},
			valueFormatter: (value: number) => (value == null ? '0' : value)
		},
		xAxis: {
			type: 'category',
			data: input.slice(0, 10).map((s) => {
				return s.env.concat(':').concat(s.app);
			}),
			axisLabel: {
				rotate: 60,
				formatter: (value: string) => {
					return truncateString(value, 23);
				}
			}
		},
		legend: {
			show: false
		},
		yAxis: {
			type: 'value',
			name: 'CPU'
		},
		series: {
			name: 'Unutilized CPU',
			data: input.slice(0, 10).map((s) => {
				return s.overage.toLocaleString('en-GB', { maximumFractionDigits: 2 });
			}),
			type: 'bar',
			itemStyle: {
				color: new graphic.LinearGradient(0, 0, 0, 1, [
					{ offset: 0, color: '#83bff6' },
					{ offset: 0.5, color: '#188df0' },
					{ offset: 1, color: '#188df0' }
				])
			},
			emphasis: {
				itemStyle: {
					color: new graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#2378f7' },
						{ offset: 0.7, color: '#2378f7' },
						{ offset: 1, color: '#83bff6' }
					])
				}
			}
		}
	} as EChartsOption;
}

export function resourceUtilizationMemoryOverageTransformLineChart(
	input: Overage[]
): EChartsOption {
	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'line'
			},
			valueFormatter: (value: number) => prettyBytes(value)
		},
		xAxis: {
			type: 'category',
			data: input.slice(0, 10).map((s) => {
				return s.env.concat(':').concat(s.app);
			}),
			axisLabel: {
				rotate: 60,
				formatter: (value: string) => {
					return truncateString(value, 23);
				}
			}
		},
		legend: {
			show: false
		},
		yAxis: {
			type: 'value',
			name: 'Memory',
			axisLabel: {
				formatter: (value: number) => prettyBytes(value)
			}
		},
		series: {
			name: 'Unutilized memory',
			data: input.slice(0, 10).map((s) => {
				return s.overage;
			}),
			type: 'bar',
			itemStyle: {
				color: new graphic.LinearGradient(0, 0, 0, 1, [
					{ offset: 0, color: '#91dc75' },
					{ offset: 0.5, color: '#41bc25' },
					{ offset: 1, color: '#41bc25' }
				])
			},
			emphasis: {
				itemStyle: {
					color: new graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#41bc25' },
						{ offset: 0.7, color: '#41bc25' },
						{ offset: 1, color: '#91dc75' }
					])
				}
			}
		}
	} as EChartsOption;
}
