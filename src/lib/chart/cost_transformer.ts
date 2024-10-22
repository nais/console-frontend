import { euroValueFormatter } from '$lib/utils/formatters';
import type { EChartsOption } from 'echarts';

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

export function costTransformStackedColumnChart(
	from: Date,
	to: Date,
	data: DailCostType
): EChartsOption {
	const categories: string[] = [];
	const seriesData: { [service: string]: number[] } = {};
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

		// Check if the entry date is within the provided range
		if (entryDate >= from && entryDate <= to) {
			categories.push(entryDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD

			if (entry.services.length === 0) {
				// No services for this day, add 0 for all services
				allServices.forEach((service) => {
					if (!seriesData[service]) {
						seriesData[service] = [];
					}
					seriesData[service].push(0);
				});
			} else {
				// Process each service for this day
				entry.services.forEach((service) => {
					if (!seriesData[service.service]) {
						seriesData[service.service] = [];
					}
					seriesData[service.service].push(service.cost);
				});

				// Add 0 for missing services on this day
				allServices.forEach((service) => {
					if (!entry.services.some((s) => s.service === service)) {
						if (!seriesData[service]) {
							seriesData[service] = [];
						}
						seriesData[service].push(0);
					}
				});
			}
		}
	});

	// Prepare the series for ECharts
	const series = Array.from(allServices).map((serviceName) => ({
		name: serviceName,
		type: 'line',
		stack: 'Cost',
		emphasis: {
			focus: 'series'
		},
		areaStyle: {},
		data: seriesData[serviceName]
	}));

	// Return the ECharts option object
	return {
		title: {},
		tooltip: {
			trigger: data.series.length > 10 ? 'item' : 'axis',
			axisPointer: {
				type: 'shadow'
			},
			valueFormatter(value: number) {
				return euroValueFormatter(value);
			}
		},
		color: ['#3386E0', '#005B82', '#C77300', '#368DA8', '#33AA5F', '#8269A2'].reverse(),
		legend: {
			bottom: 0,
			width: '90%',
			selector: [
				{
					title: 'Inverse selection',
					type: 'inverse'
				}
			],
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
				type: 'category',
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

export type TeamCostEnvType = {
	readonly env: string;
	readonly apps: {
		readonly app: string;
		readonly sum: number;
		readonly cost: {
			readonly date: Date;
			readonly cost: number;
		}[];
	}[];
};

export function costTransformColumnChartTeamCostEnv(data: TeamCostEnvType) {
	const dates = new Array<string>();
	for (
		let d = data.apps[0].cost[0].date;
		d <= data.apps[0].cost[data.apps[0].cost.length - 1].date;
		d.setUTCDate(d.getUTCDate() + 1)
	) {
		dates.push(d.toISOString().split('T')[0]);
	}

	return {
		title: {},
		legend: {
			bottom: 0,
			width: '90%',

			selector: [
				{
					title: 'Inverse selection',
					type: 'inverse'
				}
			]
		},

		tooltip: {
			trigger: data.apps.length > 10 ? 'item' : 'axis',
			axisPointer: {
				type: 'shadow'
			},
			valueFormatter(value: number) {
				return euroValueFormatter(value);
			}
		},
		color: ['#3386E0', '#005B82', '#C77300', '#368DA8', '#33AA5F', '#8269A2'].reverse(),

		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: [
			{
				type: 'category',
				data: dates.map((date) => date),
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
		series: data.apps.map((s) => {
			return {
				name: s.app,
				type: 'line',
				emphasis: {
					focus: 'series'
				},

				data: s.cost.map((d) => d.cost)
			};
		})
	} as EChartsOption;
}
