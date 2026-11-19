import { load_Deployments } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

const rows = 25;

export async function load(event) {
	if ((await event.parent()).legacyDeployDisabled) {
		redirect(307, resolve('/team/[team]', event.params));
	}

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Deployments',
			pageHeaderTitle: '',
			docPath: '/build/how-to/build-and-deploy'
		})),
		...(await load_Deployments({
			event,
			variables: {
				team: event.params.team,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
