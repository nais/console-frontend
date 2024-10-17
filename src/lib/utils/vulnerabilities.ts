export function severityToColor(severity: string): string {
	switch (severity) {
		case 'critical':
			return 'var(--a-icon-danger)';
		case 'high':
			return '#fd8b00';
		case 'medium':
			return '#ffc107';
		case 'low':
			return '#4dbd74';
		case 'unnasigned':
			return '#6e6e6e';
		default:
			return '#777777';
	}
}
