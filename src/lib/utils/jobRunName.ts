import { format } from 'date-fns';

export function generateJobRunName(jobName: string): string {
	const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
	const sanitized = jobName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
	return `${sanitized}-${timestamp}`.slice(0, 63);
}
