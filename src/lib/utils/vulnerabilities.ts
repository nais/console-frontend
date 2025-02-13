export function severityToColor(severity: string): string {
	switch (severity) {
		case 'critical':
			return '#F68282';
		case 'high':
			return '#FFC166';
		case 'medium':
			return '#FFD799';
		case 'low':
			return '#99DEAD';
		case 'unassigned':
			return '#E0E3E6';
		default:
			return '#777777';
	}
}
