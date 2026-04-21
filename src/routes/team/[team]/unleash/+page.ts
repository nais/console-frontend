import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { UnleashQuery, UnleashReleaseChannelsQuery } from './unleash';

export async function load(event) {
	const parent = await event.parent();

	// `UserInfo` is now a plain `{ data, errors }` object exposed by the
	// urql-backed root `+layout.ts` (see `runQuery`); no Svelte store unwrap
	// is needed anymore.
	if (parent.UserInfo.data?.features.unleash.enabled === false) {
		error(404, 'Unleash not enabled');
	}

	return {
		...(await addPageMeta(event, { title: 'Unleash' })),
		Unleash: await runQuery(event, UnleashQuery, { team: event.params.team }),
		UnleashReleaseChannels: await runQuery(event, UnleashReleaseChannelsQuery, {})
	};
}
