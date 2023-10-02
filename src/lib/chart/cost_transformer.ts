import type { EChartsOption, SeriesOption } from 'echarts';

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

export function costTransformTrend<SeriesType extends Type>(data: Cost<SeriesType>): EChartsOption {
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

type DataPoint = {
	readonly name: string;
	readonly value: number;
};

export function costTransformPie<SeriesType extends Type>(data: Cost<SeriesType>): EChartsOption {
	const costTypes = new Array<DataPoint>();
	for (const series of data.series) {
		costTypes.push({ name: series.costType, value: series.sum });
	}

	return {
		title: {},
		legend: {
			orient: 'horizontal',
			bottom: 0
		},
		tooltip: {
			trigger: 'item'
		},
		series: [
			{
				name: 'Cost',
				type: 'pie',
				radius: '50%',
				data: costTypes,
				emphasis: {
					itemStyle: {
						shadowBlur: 5,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					}
				}
			}
		]
	} as EChartsOption;
}

export function costTransformBar<SeriesType extends Type>(data: Cost<SeriesType>): EChartsOption {
	const dates = new Array<Date>();
	for (let d = data.from; d <= data.to; d.setDate(d.getDate() + 1)) {
		dates.push(new Date(d));
	}

	const costTypes = new Map<string, Array<number>>();
	for (const series of data.series) {
		const costType = series.costType;
		const costTypeData = new Array<number>(dates.length);
		for (let i = 0; i < dates.length; i++) {
			costTypeData[i] = 0;
		}
		for (const d of series.data) {
			const index = dates.findIndex((date) => date.getTime() === d.date.getTime());
			costTypeData[index] = d.cost;
		}
		costTypes.set(costType, costTypeData);
	}

	const series = new Array<SeriesOption>();
	for (const [costType, data] of costTypes) {
		series.push({
			name: costType,
			type: 'bar',
			stack: 'Cost',
			emphasis: {
				focus: 'series'
			},
			data: data
		});
	}

	return {
		title: {},
		legend: {},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
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
				type: 'category',
				data: dates.map((date) => date.toLocaleDateString('en-GB'))
			}
		],
		yAxis: [
			{
				type: 'value'
			}
		],
		series: series
	} as EChartsOption;
}
