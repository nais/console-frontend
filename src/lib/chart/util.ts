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
