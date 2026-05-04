import { ActivityLogActivityType, type ActivityLogActivityType$options } from '$houdini';
import { capitalizeFirstLetter } from '$lib/utils/formatters';

type WorkloadKind = 'app' | 'job';

const commonGroups: Record<string, ActivityLogActivityType$options[]> = {
	Deployment: [ActivityLogActivityType.DEPLOYMENT],
	'Kubernetes Resource': [
		ActivityLogActivityType.GENERIC_KUBERNETES_RESOURCE_CREATED,
		ActivityLogActivityType.GENERIC_KUBERNETES_RESOURCE_UPDATED
	]
};

const workloadGroups: Record<WorkloadKind, Record<string, ActivityLogActivityType$options[]>> = {
	app: {
		Application: [
			ActivityLogActivityType.APPLICATION_DELETED,
			ActivityLogActivityType.APPLICATION_RESTARTED,
			ActivityLogActivityType.APPLICATION_SCALED
		],
		...commonGroups
	},
	job: {
		Job: [
			ActivityLogActivityType.JOB_DELETED,
			ActivityLogActivityType.JOB_RUN_DELETED,
			ActivityLogActivityType.JOB_TRIGGERED
		],
		...commonGroups
	}
};

export function groupedWorkloadActivities(kind: WorkloadKind) {
	return workloadGroups[kind];
}

export function allWorkloadActivityTypes(kind: WorkloadKind): ActivityLogActivityType$options[] {
	return Object.values(groupedWorkloadActivities(kind)).flat();
}

export function activityTypeLabel(type: ActivityLogActivityType$options): string {
	return capitalizeFirstLetter(type.split('_').join(' ').toLowerCase());
}
