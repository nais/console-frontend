import { BucketOrderField, load_Buckets } from '$houdini';
import type { BucketFilter } from '$houdini/graphql/inputs';
import { parseLabelsParam } from '$lib/domain/labels/labels';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const envParam = event.url.searchParams.get('environments')?.split(',').filter(Boolean);
	const environments = envParam?.length ? envParam : undefined;
	const labels = parseLabelsParam(event.url.searchParams.get('labels'));

	return {
		...(await addPageMeta(event, {
			title: 'Buckets',
			pageHeaderTitle: '',
			docPath: '/persistence/buckets'
		})),
		...(await load_Buckets({
			event,
			variables: {
				team: event.params.team,
				filter: { environments, labels } as BucketFilter,
				orderBy: {
					field: urlToOrderField(BucketOrderField, BucketOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
