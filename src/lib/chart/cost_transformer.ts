import { euroValueFormatter } from '$lib/utils/currency';
import type { EChartsOption } from 'echarts';

interface CostEntry {
	readonly date: Date;
	readonly cost: number;
}

interface DailyCost<Data extends CostEntry> {
	readonly series: {
		readonly costType: string;
		readonly sum: number;
		readonly data: Data[];
	}[];
}

export function costTransformStackedColumnChart<SeriesType extends CostEntry>(
	from: Date,
	to: Date,
	data: DailyCost<SeriesType>
): EChartsOption {
	const dates = new Array<Date>();
	for (let d = from; d <= to; d.setDate(d.getDate() + 1)) {
		dates.push(new Date(d));
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
			trigger: data.series.length > 10 ? 'item' : 'axis',
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
				data: dates.map((date) => date.toLocaleDateString('en-GB'))
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
		series: data.series
			.sort((a, b) => (a.sum < b.sum ? -1 : a.sum > b.sum ? 1 : 0))
			.map((s) => {
				return {
					name: s.costType,
					type: 'line',
					stack: 'Cost',
					emphasis: {
						focus: 'series'
					},
					areaStyle: {},

					data: s.data.map((d) => d.cost)
				};
			})
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
	const dates = new Array<Date>();
	for (
		let d = data.apps[0].cost[0].date;
		d <= data.apps[0].cost[data.apps[0].cost.length - 1].date;
		d.setDate(d.getDate() + 1)
	) {
		dates.push(new Date(d));
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
				data: dates.map((date) => date.toLocaleDateString('en-GB'))
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
