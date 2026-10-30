import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, url }) =>
	redirect(308, `${resolve('/team/[team]/[env]/app/[app]/logs', params)}${url.search}`);
