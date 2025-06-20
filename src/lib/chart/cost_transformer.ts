import { euroValueFormatter } from '$lib/utils/formatters';
import type { EChartsOption } from 'echarts';
import type { OptionDataValue } from 'echarts/types/src/util/types.js';

export type DailCostType = {
	readonly series: {
		readonly date: Date;
		readonly services: {
			readonly cost: number;
			readonly service: string;
		}[];
		readonly sum: number;
	}[];
};

export function costTransformStackedColumnChart(data: DailCostType | undefined): EChartsOption {
	if (!data) {
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
	const seriesData: { [service: string]: [number, number][] } = {};
	const allServices = new Set<string>();

	// First pass to identify all possible services
	data.series.forEach((entry) => {
		entry.services.forEach((service) => {
			allServices.add(service.service);
		});
	});

	// Second pass to build the series data
	data.series.forEach((entry) => {
		const entryDate = new Date(entry.date);

		dates.push(entryDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD

		if (entry.services.length === 0) {
			// No services for this day, add 0 for all services
			allServices.forEach((service) => {
				if (!seriesData[service]) {
					seriesData[service] = [];
				}
				seriesData[service].push([entryDate.getTime(), 0]);
			});
		} else {
			// Process each service for this day
			entry.services.forEach((service) => {
				if (!seriesData[service.service]) {
					seriesData[service.service] = [];
				}
				seriesData[service.service].push([entryDate.getTime(), service.cost]);
			});

			// Add 0 for missing services on this day
			allServices.forEach((service) => {
				if (!entry.services.some((s) => s.service === service)) {
					if (!seriesData[service]) {
						seriesData[service] = [];
					}
					seriesData[service].push([entryDate.getTime(), 0]);
				}
			});
		}
	});

	// Prepare the series for ECharts
	const series = Array.from(allServices).map((serviceName) => ({
		name: serviceName,
		type: 'line',
		stack: 'Cost',
		areaStyle: {
			opacity: 1
		},
		showSymbol: false,
		data: seriesData[serviceName]
	}));

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
			trigger: series.length > 10 ? 'item' : 'axis',
			axisPointer: {
				type: 'shadow'
			},
			valueFormatter(value: OptionDataValue[]) {
				return euroValueFormatter(value[1] as number);
			}
		},
		legend: {
			selector: [{ title: 'Inverse selection', type: 'inverse' }],
			data: Array.from(allServices)
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
				axisLabel: {
					formatter: (value: number) => euroValueFormatter(value)
				}
			}
		],
		series
	} as EChartsOption;
}

export function costTransformColumnChartTeamEnvironmentApplicationsCost(
	series: {
		name: string | undefined;
		data: (number | undefined)[][];
	}[]
) {
	return {
		animation: false,
		title: {},
		legend: {
			// bottom: 0,
			width: '90%',
			selector: [
				{
					title: 'Inverse selection',
					type: 'inverse'
				}
			]
		},

		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
			},
			valueFormatter(value: OptionDataValue[]) {
				return euroValueFormatter(value[1] as number);
			}
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
				axisLabel: {
					formatter: (value: number) => euroValueFormatter(value)
				}
			}
		],
		series: series.map(({ name, data }) => ({
			name,
			type: 'line',
			showSymbol: false,
			data
		}))
	} as EChartsOption;
}
