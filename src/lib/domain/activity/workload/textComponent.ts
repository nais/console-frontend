import type { WorkloadActivityEntryFragment$data } from '$houdini';
import type { Component } from 'svelte';

import ApplicationActivityLogEntryText from './texts/ApplicationActivityLogEntryText.svelte';
import DefaultText from './texts/DefaultText.svelte';
import DeploymentActivityLogEntryText from './texts/DeploymentActivityLogEntryText.svelte';
import JobActivityLogEntryText from './texts/JobActivityLogEntryText.svelte';

export function workloadTextComponent(
	kind: WorkloadActivityEntryFragment$data['__typename']
): Component<{ data: WorkloadActivityEntryFragment$data }> {
	switch (kind) {
		case 'DeploymentActivityLogEntry':
			return DeploymentActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'ApplicationCreatedActivityLogEntry':
		case 'ApplicationDeletedActivityLogEntry':
		case 'ApplicationRestartedActivityLogEntry':
		case 'ApplicationScaledActivityLogEntry':
		case 'ApplicationUpdatedActivityLogEntry':
			return ApplicationActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'JobCreatedActivityLogEntry':
		case 'JobDeletedActivityLogEntry':
		case 'JobRunDeletedActivityLogEntry':
		case 'JobTriggeredActivityLogEntry':
		case 'JobUpdatedActivityLogEntry':
			return JobActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		default:
			return DefaultText as Component<{ data: WorkloadActivityEntryFragment$data }>;
	}
}
