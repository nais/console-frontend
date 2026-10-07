type Group = 'high' | 'elevated' | 'monitor' | 'all';

export function cvePagination(group: Group, url: URL, order: string) {
	const matchesOrder = url.searchParams.get(`${group}Order`) === order;
	const before = matchesOrder ? url.searchParams.get(`${group}Before`) || null : null;
	const after = matchesOrder ? url.searchParams.get(`${group}After`) || null : null;
	return {
		first: before ? null : 20,
		last: before ? 20 : null,
		after: before ? null : after,
		before
	};
}

export function cvePageParams(
	group: Group,
	direction: 'next' | 'previous',
	cursor: string | null,
	order: string
) {
	return {
		[`${group}After`]: direction === 'next' ? (cursor ?? '') : '',
		[`${group}Before`]: direction === 'previous' ? (cursor ?? '') : '',
		[`${group}Order`]: order
	};
}
