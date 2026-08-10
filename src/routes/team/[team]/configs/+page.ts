import { ConfigOrderField, load_Configs, OrderDirection } from '$houdini';
import type { ConfigFilter } from '$houdini/graphql/inputs';
import { parseLabelsParam } from '$lib/domain/labels/labels';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;
export async function load(event) {
	const nameFilter = event.url.searchParams.get('nameFilter') || '';
	const inUse = event.url.searchParams.get('inUse');
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',').filter(Boolean) || undefined;

	let filterVar: ConfigFilter | undefined = undefined;

	if (inUse === 'true' || inUse === 'false') {
		filterVar = { inUse: inUse === 'true' };
	}

	if (environments?.length) {
		filterVar = { ...filterVar, environments };
	}

	if (nameFilter) {
		filterVar = { ...filterVar, name: nameFilter };
	}

	const labels = parseLabelsParam(event.url.searchParams.get('labels'));
	if (labels) {
		filterVar = { ...filterVar, labels: labels as ConfigFilter['labels'] };
	}

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Configs',
			pageHeaderTitle: '',
			docPath: '/services/config'
		})),
		...(await load_Configs({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(ConfigOrderField, ConfigOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				filter: filterVar
			}
		}))
	};
}
