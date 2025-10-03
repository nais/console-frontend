import { ActivityLogEntryResourceType, type ActivityLogEntryResourceType$options } from '$houdini';

export const resourceLink = (
	environmentName: string,
	resourceType: ActivityLogEntryResourceType$options,
	resourceName: string,
	teamSlug: string | null
) => {
	switch (resourceType) {
		case ActivityLogEntryResourceType.APP:
			return `/team/${teamSlug}/${environmentName}/app/${resourceName}`;
		case ActivityLogEntryResourceType.JOB:
			return `/team/${teamSlug}/${environmentName}/job/${resourceName}`;
		case ActivityLogEntryResourceType.UNLEASH:
			return `/team/${teamSlug}/unleash`;
		case ActivityLogEntryResourceType.SECRET:
			return `/team/${teamSlug}/${environmentName}/secret/${resourceName}`;
		case ActivityLogEntryResourceType.TEAM:
			return `/team/${teamSlug}`;
		case ActivityLogEntryResourceType.OPENSEARCH:
			return `/team/${teamSlug}/${environmentName}/opensearch/${resourceName}`;
		case ActivityLogEntryResourceType.REPOSITORY:
			return `/team/${teamSlug}/repositories`;
		case ActivityLogEntryResourceType.VALKEY:
			return `/team/${teamSlug}/${environmentName}/valkey/${resourceName}`;
		default:
			return null;
	}
};
