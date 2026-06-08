import {
	load_OpenSearch,
	OpenSearchOrderField,
	OpenSearchTier,
	OrderDirection,
	type OpenSearchFilter
} from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

const rows = 25;

export async function load(event) {
	const { url } = event;
	const parent = await event.parent();

	const userInfoData = get(parent.UserInfo) as {
		data?: {
			features?: {
				openSearch?: {
					enabled?: boolean;
				};
			};
		};
	};

	if (userInfoData.data?.features?.openSearch?.enabled === false) {
		error(404, 'OpenSearch not enabled');
	}

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';
	const envParam = url.searchParams.get('environments')?.split(',').filter(Boolean);
	const environments = envParam?.length ? envParam : undefined;
	const validOpenSearchTiers = new Set<string>(Object.values(OpenSearchTier));
	const tiersParam = url.searchParams
		.get('tiers')
		?.split(',')
		.filter((t) => validOpenSearchTiers.has(t));
	const tiers = tiersParam?.length ? tiersParam : undefined;

	return {
		...(await addPageMeta(event, {
			title: 'OpenSearch Instances',
			pageHeaderTitle: '',
			docPath: '/persistence/opensearch'
		})),
		...(await load_OpenSearch({
			event,
			variables: {
				team: event.params.team,
				filter: { environments, tiers } as OpenSearchFilter,
				orderBy: {
					field: urlToOrderField(OpenSearchOrderField, OpenSearchOrderField.ISSUES, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.DESC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
