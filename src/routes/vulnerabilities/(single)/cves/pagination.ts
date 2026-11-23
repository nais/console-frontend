import { CVEOrderField, OrderDirection } from '$houdini';

export const cveOrderFields = {
	CVSS_SCORE: CVEOrderField.CVSS_SCORE,
	SEVERITY: CVEOrderField.SEVERITY,
	AFFECTED_WORKLOADS_COUNT: CVEOrderField.AFFECTED_WORKLOADS_COUNT,
	IDENTIFIER: CVEOrderField.IDENTIFIER
};

export const defaultCveOrder = {
	field: CVEOrderField.CVSS_SCORE,
	direction: OrderDirection.DESC
};

export const cvePaginationParams = ['high', 'elevated', 'monitor', 'all'].flatMap((group) =>
	['After', 'Before', 'Order'].map((suffix) => `${group}${suffix}`)
);

export function cvePagination(url: URL, order: string) {
	const matchesOrder = url.searchParams.get('allOrder') === order;
	const before = matchesOrder ? url.searchParams.get('allBefore') || null : null;
	const after = matchesOrder ? url.searchParams.get('allAfter') || null : null;
	return {
		first: before ? null : 20,
		last: before ? 20 : null,
		after: before ? null : after,
		before
	};
}

export function cvePageParams(
	direction: 'next' | 'previous',
	cursor: string | null,
	order: string
) {
	return {
		allAfter: direction === 'next' ? (cursor ?? '') : '',
		allBefore: direction === 'previous' ? (cursor ?? '') : '',
		allOrder: order
	};
}
