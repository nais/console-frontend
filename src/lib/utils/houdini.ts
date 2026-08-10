const NON_EXHAUSTIVE_TYPENAME = "non-exhaustive; don't match this" as const;

type NonExhaustive = { readonly __typename: typeof NON_EXHAUSTIVE_TYPENAME };

export type Exhaustive<T> = T extends NonExhaustive ? never : T;

export function exhaustive<T extends { __typename: string }>(items: readonly T[]): Exhaustive<T>[] {
	return items.filter((item): item is Exhaustive<T> => item.__typename !== NON_EXHAUSTIVE_TYPENAME);
}
