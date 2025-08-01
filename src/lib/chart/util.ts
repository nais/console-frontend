import { euroValueFormatter } from '$lib/utils/formatters';
import { createLocaleSettings, DateToken, DayOfWeek, defaultLocale } from '@layerstack/utils';

export function truncateString(str: string, num: number) {
	if (str.length <= num) {
		return str;
	}
	return str.slice(0, num - 3) + '...';
}

export function serviceColor(serviceName: string): string {
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
	if (value === 0) return '';
	if (value < 1000) {
		return euroValueFormatter(value);
	}
	return '€' + (value / 1000).toFixed(0) + 'k';
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
