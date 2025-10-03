export function resourceTypeToText(type: string) {
	switch (type) {
		case 'APP':
			return 'Application';
		case 'JOB':
			return 'Job';
		case 'VALKEY':
			return 'Valkey';
		case 'OPENSEARCH':
			return 'OpenSearch';
		default:
			return 'Resource';
	}
}
