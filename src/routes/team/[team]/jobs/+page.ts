import { JobOrderField, type TeamJobsFilter } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import type { AfterLoadEvent, JobsVariables } from './$houdini';

const rows = 25;

export const _JobsVariables: JobsVariables = ({ url }) => {
	const filter: string = url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		url.searchParams.get('environments') === 'none'
			? undefined
			: url.searchParams.get('environments')?.split(',') || [];

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		filter: { name: filter, environments } as TeamJobsFilter,
		orderBy: {
			field: urlToOrderField(JobOrderField, JobOrderField.NAME, url),
			direction: urlToOrderDirection(url)
		},
		...(before ? { before, last: rows } : { after, first: rows })
	};
};

export function _houdini_afterLoad({ data }: AfterLoadEvent) {
	return { data, rows };
}
