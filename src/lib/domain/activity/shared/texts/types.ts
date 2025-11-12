import type { ActivityLogEntryFragment$data, TeamOverviewActivityLog$result } from '$houdini';

/**
 * Union type for activity log entries from different sources.
 * This allows components to work with both list view and team overview data.
 */
export type ActivityLogEntry<T extends string> =
	| Extract<ActivityLogEntryFragment$data, { __typename: T }>
	| Extract<
			TeamOverviewActivityLog$result['team']['activityLog']['edges'][number]['node'],
			{ __typename: T }
	  >;
