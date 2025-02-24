import { ApplicationOrderField, OrderDirection, type TeamApplicationsFilter } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import type { AfterLoadEvent, ApplicationsVariables } from './$houdini';

const rows = 25;

export const _ApplicationsVariables: ApplicationsVariables = ({ url }) => {
	const filter: string = url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		url.searchParams.get('environments') === 'none'
			? undefined
			: url.searchParams.get('environments')?.split(',') || [];

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		filter: { name: filter, environments } as TeamApplicationsFilter,
		orderBy: {
			field: urlToOrderField(ApplicationOrderField, ApplicationOrderField.STATUS, url),
			direction: urlToOrderDirection(url, OrderDirection.DESC)
		},
		...(before ? { before, last: rows } : { after, first: rows })
	};
};

export function _houdini_afterLoad({ data, event: { url } }: AfterLoadEvent) {
	return {
		data,
		rows
		/*,
		initialEnvironments: url.searchParams.get('environments') ?? null*/
	};
}
