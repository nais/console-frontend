import { euroValueFormatter } from '$lib/utils/currency';
import type { EChartsOption } from 'echarts';

interface Type {
	readonly date: Date;
	readonly cost: number;
}

interface Cost<Data extends Type> {
	readonly from: Date;
	readonly to: Date;
	readonly series: {
		readonly costType: string;
		readonly app: string;
		readonly env: string;
		readonly sum: number;
		readonly team: string;
		readonly data: Data[];
	}[];
}

export function costTransformStackedColumnChart<SeriesType extends Type>(
	data: Cost<SeriesType>
): EChartsOption {
	const dates = new Array<Date>();
	for (let d = data.from; d <= data.to; d.setDate(d.getDate() + 1)) {
		dates.push(new Date(d));
	}

	return {
		title: {},
		legend: {
			bottom: 0
		},

		tooltip: {
			trigger: 'axis',
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
