import type { ActivityLogEntryFragment$data } from '$houdini';

type TypeKeyedProps = {
	[K in keyof ActivityLogEntryFragment$data as K extends `${string}ActivityLogEntry`
		? K
		: never]: ActivityLogEntryFragment$data[K];
};

type TypeKeys = keyof TypeKeyedProps;

export type ActivityLogEntry<T extends TypeKeys> = Omit<ActivityLogEntryFragment$data, TypeKeys> &
	NonNullable<ActivityLogEntryFragment$data[T]>;

export type TimelineModes = 'full' | 'sidebar';
