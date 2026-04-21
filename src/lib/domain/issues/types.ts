import { IssueFragment } from '$lib/domain/list-items/issueListItem';
import type { ResultOf } from '@graphql-typed-document-node/core';

/**
 * Helper type for the per-`__typename` issue components under
 * `$lib/domain/issues/`. Replaces Houdini's
 * `Extract<IssueFragment$data, { __typename: T }>`.
 */
export type Issue<T extends string> = Extract<ResultOf<typeof IssueFragment>, { __typename: T }>;
