import type { ApplicationInstanceState$options } from '$houdini';

type InstanceStatus = { state: ApplicationInstanceState$options; ready: boolean };
type Instance = { status: InstanceStatus & { message: string } };

export function applicationInstanceStatus({ state, ready }: InstanceStatus) {
	switch (state) {
		case 'RUNNING':
			return ready
				? { label: 'Ready', variant: 'success' as const }
				: { label: 'Running, not ready', variant: 'warning' as const };
		case 'PENDING':
			return { label: 'Waiting for placement', variant: 'warning' as const };
		case 'STARTING':
			return { label: 'Starting', variant: 'info' as const };
		case 'FAILING':
			return { label: 'Failing', variant: 'error' as const };
		case 'TERMINATED':
			return { label: 'Terminated', variant: 'neutral' as const };
		default:
			return { label: 'Unknown', variant: 'neutral' as const };
	}
}

function isReady({ status }: { status: InstanceStatus }) {
	return status.state === 'RUNNING' && status.ready;
}

export function countReadyInstances(instances: readonly { status: InstanceStatus }[]) {
	return instances.filter(isReady).length;
}

export function summarizeUnreadyInstances(instances: readonly Instance[]) {
	const summaries = new Map<
		string,
		ReturnType<typeof applicationInstanceStatus> & { message: string; count: number }
	>();
	for (const { status } of instances) {
		if (isReady({ status })) continue;
		const { message } = status;
		const key = `${status.state}:${message}`;
		const summary = summaries.get(key);
		if (summary) {
			summary.count++;
		} else {
			summaries.set(key, { ...applicationInstanceStatus(status), message, count: 1 });
		}
	}
	return summaries;
}
