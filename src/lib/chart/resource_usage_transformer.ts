import type { ResourceType, ValueOf } from '$houdini';
import { euroValueFormatter } from '$lib/utils/currency';
import { graphic, type EChartsOption } from 'echarts';
import prettyBytes from 'pretty-bytes';

export interface Memory {
	readonly timestamp: Date;
	readonly request: number;
	readonly usage: number;
}

export function resourceUsageMemoryTransformLineChart(input: Memory[]): EChartsOption {
	const dates = new Array<Date>();
	for (let i = 0; i < input.length; i++) {
		dates.push(new Date(input[i].timestamp));
	}

	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'line'
			},
			valueFormatter: (value: number) => prettyBytes(value == null ? 0 : value)
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
			},
			scale: true
		},
		series: [
			{
				type: 'line',
				name: 'Memory request',
				data: input.map((s) => {
					if (s.request === 0) {
						return null;
					}
					return s.request;
				}),
				showSymbol: false
			},
			{
				type: 'line',
				name: 'Memory usage',
				data: input.map((s) => {
					if (s.usage === 0) {
						return null;
					}

					return s.usage;
				}),
				showSymbol: false
			}
		]
	} as EChartsOption;
}

export interface CPU {
	readonly timestamp: Date;
	readonly request: number;
	readonly usage: number;
}

export function resourceUsageCPUTransformLineChart(input: CPU[]): EChartsOption {
	const dates = new Array<Date>();
	for (let i = 0; i < input.length; i++) {
		dates.push(new Date(input[i].timestamp));
	}

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
			name: 'CPU',
			scale: true
		},
		series: [
			{
				type: 'line',
				name: 'Requested cores',
				data: input.map((s) => {
					if (s.request === 0) {
						return null;
					}
					return s.request;
				}),
				showSymbol: false
			},
			{
				type: 'line',
				name: 'Used cores',
				data: input.map((s) => {
					if (s.usage === 0) {
						return null;
					}
					return s.usage;
				}),
				showSymbol: false
			}
		]
	} as EChartsOption;
}

export interface Utilization {
	readonly resource: ValueOf<typeof ResourceType>;
	readonly timestamp: Date;
	readonly request: number;
	readonly usage: number;
	readonly requestCost: number;
	readonly requestCostOverage: number;
	readonly usageCost: number;
}

export function resourceUsageTeamCPUTransformLineChart(input: Utilization[]): EChartsOption {
	const dates = new Array<Date>();
	for (let i = 0; i < input.length; i++) {
		dates.push(new Date(input[i].timestamp));
	}

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
			boundaryGap: false,
			data: dates.map((date) => {
				return date.toLocaleTimeString('en-GB', {
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
			name: 'CPU',
			scale: true
		},
		series: [
			{
				type: 'line',
				name: 'Requested cores',
				data: input.map((s) => {
					if (s.request === 0) {
						return null;
					}
					return s.request;
				}),
				showSymbol: false
			},
			{
				type: 'line',
				name: 'Used cores',
				data: input.map((s) => {
					if (s.usage === 0) {
						return null;
					}
					return s.usage;
				}),
				showSymbol: false
			}
		]
	} as EChartsOption;
}

export function resourceUsageTeamMemoryTransformLineChart(input: Utilization[]): EChartsOption {
	const dates = new Array<Date>();
	for (let i = 0; i < input.length; i++) {
		dates.push(new Date(input[i].timestamp));
	}

	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'line'
			},
			valueFormatter: (value: number) => prettyBytes(value == null ? 0 : value)
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: dates.map((date) => {
				return date.toLocaleTimeString('en-GB', {
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
			name: 'Memory',
			axisLabel: {
				formatter: (value: number) => prettyBytes(value)
			},
			scale: true
		},
		series: [
			{
				type: 'line',
				name: 'Requested memory',
				data: input.map((s) => {
					if (s.request === 0) {
						return null;
					}
					return s.request;
				}),
				showSymbol: false
			},
			{
				type: 'line',
				name: 'Used memory',
				data: input.map((s) => {
					if (s.usage === 0) {
						return null;
					}
					return s.usage;
				}),
				showSymbol: false
			}
		]
	} as EChartsOption;
}

export interface Overage {
	readonly overage: number;
	readonly env: string;
	readonly team: string;
	readonly app: string;
}

export function resourceUtilizationOverageTransformLineChart(input: Overage[]): EChartsOption {
	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
			},
			valueFormatter: euroValueFormatter
		},
		xAxis: {
			type: 'category',
			data: input.slice(0, 10).map((s) => {
				return s.env.concat(':').concat(s.app);
			}),
			axisLabel: {
				rotate: 25
			}
		},
		legend: {
			show: false
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				formatter: euroValueFormatter
			}
		},
		series: {
			name: 'Overage',
			data: input.slice(0, 10).map((s) => {
				return s.overage;
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
