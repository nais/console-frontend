import {
	load_OpenSearch,
	OpenSearchOrderField,
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
	const environments: string[] | undefined =
		url.searchParams.get('environments')?.split(',').filter(Boolean) || undefined;
	const tiers: string[] | undefined =
		url.searchParams.get('tiers')?.split(',').filter(Boolean) || undefined;

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
