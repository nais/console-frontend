import {
	allSeverities,
	severityToColor,
	severityToRiskScore,
	type Severity
} from '$lib/utils/vulnerabilities';
import { format } from 'date-fns';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

export type ImageVulnerabilityHistory =
	| {
			samples: {
				date: Date;
				summary: {
					critical: number;
					high: number;
					low: number;
					medium: number;
					unassigned: number;
				};
			}[];
	  }
	| undefined
	| null;

export function transformVulnerabilities(
	data: ImageVulnerabilityHistory | null,
	riskScoreToggle: boolean
): EChartsOption {
	if (!data || !data?.samples.length) {
		return {} as EChartsOption;
	}

	const seriesData: Record<string, [Date, number | string][]> = {};

	for (const entry of data.samples) {
		const theDate = new Date(entry.date);
		theDate.setHours(0, 0, 0, 0);

		for (const severity of allSeverities) {
			const rawCount = entry.summary[severity.toLowerCase() as keyof typeof entry.summary] ?? 0;
			// const value = riskScoreToggle ? rawCount * severityToRiskScore[severity] : rawCount;
			const value =
				rawCount === 0
					? '-'
					: riskScoreToggle
						? rawCount * severityToRiskScore[severity]
						: rawCount;
			(seriesData[severity] ??= []).push([theDate, value]);
		}
	}

	const series = [...allSeverities].reverse().map((severity) => ({
		name: severity,
		type: 'line',
		stack: 'Vulnerabilities',
		areaStyle: { opacity: 1 },
		showSymbol: false,
		color: severityToColor({ severity, isGraph: true }),
		data: seriesData[severity]
	}));

	return {
		animation: false,
		title: {},
		tooltip: {
			trigger: 'axis',
			formatter: (value: CallbackDataParams[]) => {
				let date = '';
				if (value[0] && Array.isArray(value[0].value)) {
					const raw = (value[0].value as [number | string | Date, number])[0];
					const parsedDate =
						typeof raw === 'string' || typeof raw === 'number' ? new Date(raw) : raw;
					date = format(parsedDate, 'dd/MM/yyyy');
				}
				const rows = value
					.sort(
						(a, b) =>
							allSeverities.indexOf(a.seriesName as Severity) -
							allSeverities.indexOf(b.seriesName as Severity)
					)
					.map(
						(v) =>
							`<div style="display:flex;align-items:center;gap:0.25rem;">
					<div style="height:8px;width:8px;border-radius:50%;background:${v.color};"></div>
					${v.seriesName}
				</div><div style="text-align:right;">${(v.value as [number, number])[1]}</div>`
					)
					.join('');
				return `<div>${date}</div><hr/><div style="display:grid;grid-template-columns:auto auto;gap:0.5rem;">${rows}</div>`;
			}
		},
		legend: {
			selector: [{ title: 'Inverse selection', type: 'inverse' }],
			data: allSeverities
		},
		grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
		xAxis: [{ type: 'time', boundaryGap: false }],
		yAxis: [{ type: 'value', name: riskScoreToggle ? 'Risk Score' : '# of vulnerabilities' }],
		series
	} as EChartsOption;
}
