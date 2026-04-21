import { SidebarActivityLogFragment } from '$lib/domain/activity/sidebar/sidebarActivity';
import type { ResultOf } from '@graphql-typed-document-node/core';

type SidebarActivityLogEntryNode = ResultOf<
	typeof SidebarActivityLogFragment
>['activityLog']['nodes'][number];

export type SidebarActivityLogEntry<T extends string> = Extract<
	SidebarActivityLogEntryNode,
	{ __typename: T }
>;

export type SidebarActivityLogEntryAny = SidebarActivityLogEntryNode;
