import { euroValueFormatter } from '$lib/utils/formatters';
import { createLocaleSettings, DateToken, DayOfWeek, defaultLocale } from '@layerstack/utils';

export function truncateString(str: string, num: number) {
	if (str.length <= num) {
		return str;
	}
	return str.slice(0, num - 3) + '...';
}

export type ServiceName =
	| 'Cloud SQL'
	| 'Cloud Storage'
	| 'Compute Engine'
	| 'Cloud Key Management Service (KMS)'
	| 'BigQuery'
	| 'InfluxDB'
	| 'Redis'
	| 'OpenSearch'
	| 'Secret Manager'
	| 'Kubernetes Engine'
	| 'Networking'
	| 'Cloud Workstations'
	| 'Confidential Computing'
	| 'Valkey'
	| 'Kafka Shared'
	| 'Kafka Tiered Storage';

export function serviceColor(serviceName: ServiceName | string): string {
	switch (serviceName) {
		case 'Cloud SQL':
			return '#B45E5A'; // muted red
		case 'Cloud Storage':
			return '#C88B4A'; // soft orange-brown
		case 'Compute Engine':
			return '#D6C36E'; // dusty yellow
		case 'Cloud Key Management Service (KMS)':
			return '#9FCB8C'; // muted chartreuse
		case 'BigQuery':
			return '#6CA6CD'; // soft sky blue
		case 'InfluxDB':
			return '#5B84C4'; // dusty blue
		case 'Redis':
			return '#A4C88F'; // soft lime green
		case 'OpenSearch':
			return '#A18BC6'; // muted blue violet
		case 'Secret Manager':
			return '#C48FB1'; // dusty rose pink
		case 'Kubernetes Engine':
			return '#B76D9A'; // softer deep pink
		case 'Networking':
			return '#C586A0'; // faded pink
		case 'Cloud Workstations':
			return '#C97B6A'; // soft coral
		case 'Confidential Computing':
			return '#C77C38'; // toned-down orange
		case 'Valkey':
			return '#BA8FC1'; // muted magenta
		case 'Kafka Shared':
			return '#7BAF7A'; // desaturated green
		case 'Kafka Tiered Storage':
			return '#7BC2B5'; // subdued turquoise
		default:
			return '#689FD3'; // muted dodger blue
	}
}

export function euroAxisFormatter(value: number) {
	if (value === 0) return '0 €';
	if (value < 1000) {
		return euroValueFormatter(value);
	}
	const kValue = value / 1000;
	// Use 1 decimal place if needed to avoid duplicates
	if (kValue % 1 === 0) {
		return '€' + kValue.toFixed(0) + 'K';
	} else {
		return '€' + kValue.toFixed(1) + 'K';
	}
}

export const PrometheusChartQueryInterval = {
	OneHour: '1h',
	SixHours: '6h',
	OneDay: '1d',
	SevenDays: '7d',
	ThirtyDays: '30d'
} as const;

export type PrometheusChartQueryInterval =
	(typeof PrometheusChartQueryInterval)[keyof typeof PrometheusChartQueryInterval];

export function getStepFromInterval(interval: PrometheusChartQueryInterval): number {
	switch (interval) {
		case PrometheusChartQueryInterval.OneHour:
			return 30; // 30s step → 120 points
		case PrometheusChartQueryInterval.SixHours:
			return 180; // 3m step → 120 points
		case PrometheusChartQueryInterval.OneDay:
			return 720; // 12m step → 120 points
		case PrometheusChartQueryInterval.SevenDays:
			return 3600; // 1h step → 168 points
		case PrometheusChartQueryInterval.ThirtyDays:
			return 14400; // 4h step → 180 points
		default:
			return 30;
	}
}

export function getStartFromInterval(interval: PrometheusChartQueryInterval): Date {
	const now = new Date();
	switch (interval) {
		case PrometheusChartQueryInterval.OneHour:
			return new Date(now.getTime() - 1 * 60 * 60 * 1000);
		case PrometheusChartQueryInterval.SixHours:
			return new Date(now.getTime() - 6 * 60 * 60 * 1000);
		case PrometheusChartQueryInterval.OneDay:
			return new Date(now.getTime() - 24 * 60 * 60 * 1000);
		case PrometheusChartQueryInterval.SevenDays:
			return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		case PrometheusChartQueryInterval.ThirtyDays:
			return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		default:
			return new Date(now.getTime() - 1 * 60 * 60 * 1000);
	}
}

function getRateIntervalFromStep(stepSeconds: number): string {
	// Calculate optimal rate interval as 4x the step interval
	// with a minimum of the scrape interval (30s) and maximum of 5m
	const rateIntervalSeconds = Math.max(30, Math.min(300, stepSeconds * 4));

	if (rateIntervalSeconds >= 60) {
		return `${Math.floor(rateIntervalSeconds / 60)}m`;
	}
	return `${rateIntervalSeconds}s`;
}

export function replaceQueryVariables(
	query: string,
	interval: PrometheusChartQueryInterval
): string {
	const stepSeconds = getStepFromInterval(interval);
	const rateInterval = getRateIntervalFromStep(stepSeconds);

	// Replace Grafana-style variables
	return query
		.replace(/\$__rate_interval/g, rateInterval)
		.replace(/\$__interval/g, `${stepSeconds}s`)
		.replace(/\$__interval_ms/g, `${stepSeconds * 1000}`);
}

export function localizeLayerChart() {
	Object.assign(
		defaultLocale,
		createLocaleSettings({
			locale: 'gb',
			formats: {
				numbers: {
					defaults: {
						currency: 'EUR',
						fractionDigits: 2,
						currencyDisplay: 'symbol'
					}
				},
				dates: {
					baseParsing: 'dd/MM/yyyy',
					weekStartsOn: DayOfWeek.Monday,
					ordinalSuffixes: {
						one: 'st',
						two: 'nd',
						few: 'rd',
						other: 'th'
					},
					presets: {
						day: {
							short: 'MM/dd/MM',
							default: 'MM/dd/MM',
							long: 'MM/dd/MM'
						},
						dayTime: {
							short: [
								DateToken.DayOfMonth_2Digit,
								DateToken.Month_numeric,
								DateToken.Year_numeric,
								DateToken.Hour_numeric,
								DateToken.Minute_numeric
							],
							default: [
								DateToken.DayOfMonth_2Digit,
								DateToken.Month_numeric,
								DateToken.Year_numeric,
								DateToken.Hour_2Digit,
								DateToken.Minute_2Digit
							],
							long: [
								DateToken.DayOfMonth_2Digit,
								DateToken.Month_numeric,
								DateToken.Year_numeric,
								DateToken.Hour_2Digit,
								DateToken.Minute_2Digit,
								DateToken.Second_2Digit
							]
						},
						timeOnly: {
							short: [DateToken.Hour_numeric, DateToken.Minute_numeric],
							default: [DateToken.Hour_2Digit, DateToken.Minute_2Digit, DateToken.Second_2Digit],
							long: [
								DateToken.Hour_2Digit,
								DateToken.Minute_2Digit,
								DateToken.Second_2Digit,
								DateToken.MiliSecond_3
							]
						},
						hour: {
							short: [DateToken.Hour_woAMPM],
							default: [DateToken.Hour_woAMPM],
							long: [DateToken.Hour_woAMPM]
						},
						minute: {
							short: [DateToken.Hour_numeric, DateToken.Minute_numeric],
							default: [DateToken.Hour_numeric, DateToken.Minute_numeric],
							long: [DateToken.Hour_2Digit, DateToken.Minute_2Digit]
						},
						second: {
							short: [DateToken.Hour_numeric, DateToken.Minute_numeric, DateToken.Second_numeric],
							default: [DateToken.Hour_numeric, DateToken.Minute_numeric, DateToken.Second_numeric],
							long: [DateToken.Hour_2Digit, DateToken.Minute_2Digit, DateToken.Second_2Digit]
						},
						millisecond: {
							short: [
								DateToken.Hour_numeric,
								DateToken.Minute_numeric,
								DateToken.Second_numeric,
								DateToken.MiliSecond_3
							],
							default: [
								DateToken.Hour_numeric,
								DateToken.Minute_numeric,
								DateToken.Second_numeric,
								DateToken.MiliSecond_3
							],
							long: [
								DateToken.Hour_2Digit,
								DateToken.Minute_2Digit,
								DateToken.Second_2Digit,
								DateToken.MiliSecond_3
							]
						},
						week: {
							short: [DateToken.DayOfMonth_2Digit, DateToken.Month_numeric],
							default: [
								DateToken.DayOfMonth_2Digit,
								DateToken.Month_numeric,
								DateToken.Year_numeric
							],
							long: [DateToken.DayOfMonth_2Digit, DateToken.Month_numeric, DateToken.Year_numeric]
						},
						month: {
							short: DateToken.Month_short,
							default: DateToken.Month_long,
							long: [DateToken.Month_long, DateToken.Year_numeric]
						},
						monthsYear: {
							short: [DateToken.Month_short, DateToken.Year_2Digit],
							default: [DateToken.Month_long, DateToken.Year_numeric],
							long: [DateToken.Month_long, DateToken.Year_numeric]
						},
						year: {
							short: DateToken.Year_2Digit,
							default: DateToken.Year_numeric,
							long: DateToken.Year_numeric
						}
					}
				}
			}
		})
	);
}
