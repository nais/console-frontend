export const recentWorkloadEventCount = 5;

export function workloadEventPageVariables(searchParams: URLSearchParams) {
	const rows = 20;
	const before = searchParams.get('before');
	return before
		? { last: rows, before }
		: { first: rows, after: searchParams.get('after') || undefined };
}
