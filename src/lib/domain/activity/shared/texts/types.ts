import { ActivityLogEntryFragment } from '$lib/domain/list-items/activityLogListItem';
import type { ResultOf } from '@graphql-typed-document-node/core';

export type ActivityLogEntry<T extends string> = Extract<
	ResultOf<typeof ActivityLogEntryFragment>,
	{ __typename: T }
>;
