import { format } from 'date-fns';

export function validateJobRunName(name: string): string | undefined {
	if (!name) {
		return 'Run name is required.';
	}
	if (name.length > 63) {
		return 'Run name must be 63 characters or fewer.';
	}
	if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(name)) {
		return 'Use lowercase letters, numbers and hyphens only, with no spaces. Start and end with a letter or number.';
	}
	return undefined;
}

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
