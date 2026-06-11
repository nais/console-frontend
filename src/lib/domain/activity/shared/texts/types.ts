import type { ActivityLogEntryFragment$data } from '$houdini';

export type ActivityLogEntry<T extends string> = Extract<
	ActivityLogEntryFragment$data,
	{ __typename: T }
>;

export type TimelineModes = 'full' | 'sidebar';
