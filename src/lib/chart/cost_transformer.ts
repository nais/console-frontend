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
		readonly team: string;
		readonly data: Data[];
	}[];
}

export function costTransform<SeriesType extends Type>(data: Cost<SeriesType>): EChartsOption {
	return {
		title: {},
		legend: {
			orient: 'horizontal',
			bottom: 0
		},
		tooltip: {
			trigger: 'axis'
		},
		xAxis: {
			type: 'category'
		},
		yAxis: {
			type: 'value'
		},
		series: data.series.map((s) => ({
			name: s.costType,
			type: 'line',
			data: s.data.map((d) => [d.date.toLocaleDateString('en-GB'), d.cost]),
			tooltip: {
				valueFormatter(value: number) {
					return value.toLocaleString('en-GB', {
						style: 'currency',
						currency: 'EUR'
					});
				}
			}
		}))
	} as EChartsOption;
}
