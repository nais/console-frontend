import type { ActivityLogEntryFragment$data } from '$houdini';

export type WorkloadActivityEntry<T extends string = string> = Extract<
	ActivityLogEntryFragment$data,
	{ __typename: T }
>;
