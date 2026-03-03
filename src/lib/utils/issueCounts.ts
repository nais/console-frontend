type IssueEdge = {
	node?: {
		severity?: string | null;
	} | null;
} | null;

export function countIssuesBySeverity(
	edges: IssueEdge[] | null | undefined,
	severity: string
): number {
	if (!edges) {
		return 0;
	}

	return edges.filter((edge) => edge?.node?.severity === severity).length;
}
