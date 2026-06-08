import {
	load_Valkeys,
	OrderDirection,
	ValkeyOrderField,
	ValkeyTier,
	type ValkeyFilter
} from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

const rows = 25;

export async function load(event) {
	const parent = await event.parent();

	const userInfoData = get(parent.UserInfo) as {
		data?: {
			features?: {
				valkey?: {
					enabled?: boolean;
				};
			};
		};
	};

	if (userInfoData.data?.features?.valkey?.enabled === false) {
		error(404, 'Valkey not enabled');
	}

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const envParam = event.url.searchParams.get('environments')?.split(',').filter(Boolean);
	const environments = envParam?.length ? envParam : undefined;
	const validValkeyTiers = new Set<string>(Object.values(ValkeyTier));
	const tiersParam = event.url.searchParams
		.get('tiers')
		?.split(',')
		.filter((t) => validValkeyTiers.has(t));
	const tiers = tiersParam?.length ? tiersParam : undefined;

	return {
		...(await addPageMeta(event, {
			title: 'Valkey Instances',
			pageHeaderTitle: '',
			docPath: '/persistence/valkey'
		})),
		...(await load_Valkeys({
			event,
			variables: {
				team: event.params.team,
				filter: { environments, tiers } as ValkeyFilter,
				orderBy: {
					field: urlToOrderField(ValkeyOrderField, ValkeyOrderField.ISSUES, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.DESC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
