export function severityToColor(severity: string): string {
	switch (severity) {
		case 'critical':
			return '#f86c6b';
		case 'high':
			return '#fd8b00';
		case 'medium':
			return '#ffc107';
		case 'low':
			return '#4dbd74';
		default:
			return '#777777';
	}
}
