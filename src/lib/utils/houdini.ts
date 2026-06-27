type NonExhaustive = { readonly __typename: "non-exhaustive; don't match this" };

export type Exhaustive<T> = T extends NonExhaustive ? never : T;

export function exhaustive<T extends { __typename: string }>(items: readonly T[]): Exhaustive<T>[] {
	return items.filter(
		(item): item is Exhaustive<T> => item.__typename !== "non-exhaustive; don't match this"
	);
}
