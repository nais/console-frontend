import { allSeverities, severityToRiskScore } from '$lib/utils/vulnerabilities';

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

export function normalizeVal(val: number | string): number {
	return typeof val === 'number' ? val : 0;
}

export type VulnerabilitiesChartData = {
	date: Date;
	[key: string]: number | Date;
};

export function transformLayerchartVulnerabilities(
	data: ImageVulnerabilityHistory | null,
	riskScoreToggle: boolean
): { data: VulnerabilitiesChartData[]; series: object[] } {
	if (!data || !data?.samples.length) {
		return { data: [], series: [] };
	}

	const seriesData: VulnerabilitiesChartData[] = [];
	for (const entry of data.samples) {
		const theDate = new Date(entry.date);
		theDate.setHours(0, 0, 0, 0);

		const entryData: VulnerabilitiesChartData = { date: theDate };

		for (const severity of allSeverities) {
			const rawCount = entry.summary[severity.toLowerCase() as keyof typeof entry.summary] ?? 0;
			const value = riskScoreToggle ? rawCount * severityToRiskScore[severity] : rawCount;
			entryData[severity] = value;
		}

		seriesData.push(entryData);
	}

	return {
		data: seriesData,
		series: []
	};
}
