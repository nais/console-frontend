// import { euroValueFormatter } from '$lib/utils/formatters';
// import { format } from 'date-fns';
// import { type EChartsOption } from 'echarts';
// import type { CallbackDataParams } from 'echarts/types/src/util/types.js';
// import { normalizeVal } from './transformVulnerabilities';
// import { serviceColor } from './util';

// export type DailCostType = {
// 	readonly series: {
// 		readonly date: Date;
// 		readonly services: {
// 			readonly cost: number;
// 			readonly service: string;
// 		}[];
// 		readonly sum: number;
// 	}[];
// };

// export function costTransformStackedColumnChart(data: DailCostType | undefined): EChartsOption {
// 	if (!data) {
// 		return {
// 			animation: false,
// 			title: {
// 				text: 'No data',
// 				left: 'center',
// 				top: 'center',
// 				textStyle: {
// 					color: '#aaa'
// 				}
// 			}
// 		} as EChartsOption;
// 	}

// 	const dates: string[] = [];
// 	const seriesData: { [service: string]: [number, number][] } = {};
// 	const allServices = new Set<string>();

// 	// First pass to identify all possible services
// 	data.series.forEach((entry) => {
// 		entry.services.forEach((service) => {
// 			allServices.add(service.service);
// 		});
// 	});

// 	// Second pass to build the series data
// 	data.series.forEach((entry) => {
// 		const entryDate = new Date(entry.date);

// 		dates.push(entryDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD

// 		if (entry.services.length === 0) {
// 			// No services for this day, add 0 for all services
// 			allServices.forEach((service) => {
// 				if (!seriesData[service]) {
// 					seriesData[service] = [];
// 				}
// 				seriesData[service].push([entryDate.getTime(), 0]);
// 			});
// 		} else {
// 			// Process each service for this day
// 			entry.services.forEach((service) => {
// 				if (!seriesData[service.service]) {
// 					seriesData[service.service] = [];
// 				}
// 				seriesData[service.service].push([entryDate.getTime(), service.cost]);
// 			});

// 			// Add 0 for missing services on this day
// 			allServices.forEach((service) => {
// 				if (!entry.services.some((s) => s.service === service)) {
// 					if (!seriesData[service]) {
// 						seriesData[service] = [];
// 					}
// 					seriesData[service].push([entryDate.getTime(), 0]);
// 				}
// 			});
// 		}
// 	});

// 	// Prepare the series for ECharts
// 	const series = Array.from(allServices)
// 		.map((serviceName) => ({
// 			name: serviceName,
// 			color: serviceColor(serviceName), // Default color per service
// 			type: 'line',
// 			stack: 'Cost',
// 			areaStyle: {
// 				opacity: 1
// 			},
// 			showSymbol: false,
// 			data: seriesData[serviceName]
// 		}))
// 		.toSorted((a, b) => {
// 			const aValue = seriesData[a.name].at(-1)?.[1] ?? 0;
// 			const bValue = seriesData[b.name].at(-1)?.[1] ?? 0;
// 			return aValue - bValue;
// 		});

// 	// Return the ECharts option object
// 	return {
// 		animation: false,
// 		title:
// 			series.length === 0
// 				? {
// 						text: 'No data',
// 						left: 'center',
// 						top: 'center',
// 						textStyle: {
// 							color: '#aaa'
// 						}
// 					}
// 				: {},
// 		tooltip: {
// 			trigger: 'axis',
// 			formatter: (value: CallbackDataParams[]) => {
// 				let date = '';
// 				let total = 0;

// 				if (value[0] && Array.isArray(value[0].value)) {
// 					const raw = (value[0].value as [number | string | Date, number])[0];
// 					const parsedDate =
// 						typeof raw === 'string' || typeof raw === 'number' ? new Date(raw) : raw;
// 					date = format(parsedDate, 'dd/MM/yyyy');
// 				}

// 				const rows = value
// 					.toSorted((a, b) => {
// 						// make sure most expensive service is first to match the chart order
// 						if (!a.value || !b.value) return 0;
// 						if (!Array.isArray(a.value) || !Array.isArray(b.value)) return 0;
// 						if (typeof a.value[1] !== 'number' || typeof b.value[1] !== 'number') return 0;
// 						return b.value[1] - a.value[1];
// 					})
// 					.map((v) => {
// 						const valRaw = (v.value as [number | string | Date, number | string])[1];
// 						const val = normalizeVal(valRaw);

// 						total += val;

// 						return `<div style="display:flex;align-items:center;gap:0.25rem;">
// 							<div style="height:8px;width:8px;border-radius:50%;background:${v.color};"></div>
// 							${v.seriesName}
// 						</div><div style="text-align:right;">${euroValueFormatter(normalizeVal(valRaw))}</div>`;
// 					})
// 					.join('');

// 				return `<div>${date}</div>
// 					<div style="font-weight:bold;margin:0.25rem 0;">Total cost: ${euroValueFormatter(total)}</div>
// 					<hr/>
// 					<div style="display:grid;grid-template-columns:auto auto;gap:0.5rem;">${rows}</div>`;
// 			}
// 		},
// 		legend: {
// 			selector: [{ title: 'Inverse selection', type: 'inverse' }],
// 			data: Array.from(allServices),
// 			top: '0%'
// 		},
// 		grid: {
// 			left: '3%',
// 			right: '4%',
// 			bottom: '3%',
// 			containLabel: true
// 		},
// 		xAxis: [
// 			{
// 				type: 'time',
// 				boundaryGap: false
// 			}
// 		],
// 		yAxis: [
// 			{
// 				type: 'value',
// 				axisLabel: {
// 					formatter: (value: number) => euroValueFormatter(value)
// 				}
// 			}
// 		],
// 		series
// 	} as EChartsOption;
// }

// export function costTransformColumnChartTeamEnvironmentApplicationsCost(
// 	series: {
// 		name: string | undefined;
// 		data: (number | undefined)[][];
// 	}[]
// ) {
// 	return {
// 		animation: false,
// 		title: {},
// 		legend: {
// 			top: '0%',
// 			width: '90%',
// 			selector: [
// 				{
// 					title: 'Inverse selection',
// 					type: 'inverse'
// 				}
// 			]
// 		},
// 		tooltip: {
// 			trigger: 'axis',
// 			formatter: (value: CallbackDataParams[]) => {
// 				let date = '';
// 				let total = 0;

// 				if (value[0] && Array.isArray(value[0].value)) {
// 					const raw = (value[0].value as [number | string | Date, number])[0];
// 					const parsedDate =
// 						typeof raw === 'string' || typeof raw === 'number' ? new Date(raw) : raw;
// 					date = format(parsedDate, 'dd/MM/yyyy');
// 				}

// 				const rows = value
// 					.map((v) => {
// 						const valRaw = (v.value as [number | string | Date, number | string])[1];
// 						const val = normalizeVal(valRaw);

// 						total += val;

// 						return `<div style="display:flex;align-items:center;gap:0.25rem;">
// 							<div style="height:8px;width:8px;border-radius:50%;background:${v.color};"></div>
// 							${v.seriesName}
// 						</div><div style="text-align:right;">${euroValueFormatter(normalizeVal(valRaw))}</div>`;
// 					})
// 					.join('');

// 				return `<div>${date}</div>
// 					<div style="font-weight:bold;margin:0.25rem 0;">Total cost: ${euroValueFormatter(total)}</div>
// 					<hr/>
// 					<div style="display:grid;grid-template-columns:auto auto;gap:0.5rem;">${rows}</div>`;
// 			}
// 		},
// 		grid: {
// 			left: '3%',
// 			right: '4%',
// 			bottom: '3%',
// 			containLabel: true
// 		},
// 		xAxis: [
// 			{
// 				type: 'time',
// 				boundaryGap: false
// 			}
// 		],
// 		yAxis: [
// 			{
// 				type: 'value',
// 				axisLabel: {
// 					formatter: (value: number) => euroValueFormatter(value)
// 				}
// 			}
// 		],
// 		series: series.map(({ name, data }) => ({
// 			name,
// 			type: 'line',
// 			showSymbol: false,
// 			data
// 		}))
// 	} as EChartsOption;
// }
