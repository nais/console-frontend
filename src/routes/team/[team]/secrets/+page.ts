import { load_Secrets, OrderDirection, SecretOrderField, type SecretFilter } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;
export async function load(event) {
	const nameFilter = event.url.searchParams.get('nameFilter') || '';
	const inUse = event.url.searchParams.get('inUse');
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',').filter(Boolean) || undefined;

	let filterVar: SecretFilter | undefined = undefined;

	if (inUse === 'true' || inUse === 'false') {
		filterVar = { inUse: inUse === 'true' };
	}

	if (environments?.length) {
		filterVar = { ...filterVar, environments };
	}

	if (nameFilter) {
		filterVar = { ...filterVar, name: nameFilter };
	}

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Secrets',
			pageHeaderTitle: '',
			docPath: '/services/secrets'
		})),
		...(await load_Secrets({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(SecretOrderField, SecretOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				filter: filterVar
			}
		}))
	};
}
