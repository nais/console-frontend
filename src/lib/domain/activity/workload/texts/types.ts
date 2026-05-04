import type { WorkloadActivityEntryFragment$data } from '$houdini';

export type WorkloadActivityEntry<
	T extends string = WorkloadActivityEntryFragment$data['__typename']
> = Extract<WorkloadActivityEntryFragment$data, { __typename: T }>;
