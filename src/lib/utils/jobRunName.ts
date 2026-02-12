import { format } from 'date-fns';

export function generateJobRunName(jobName: string): string {
	const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
	const maxNameLength = 63;
	const maxPrefixLength = maxNameLength - 1 - timestamp.length;

	let sanitized = jobName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
	sanitized = sanitized.replace(/^-+|-+$/g, '');

	let prefix: string;
	if (maxPrefixLength > 0) {
		prefix = sanitized.slice(0, maxPrefixLength).replace(/^-+|-+$/g, '');
	} else {
		prefix = '';
	}

	if (!prefix) {
		prefix = 'run';
	}

	return `${prefix}-${timestamp}`;
}
