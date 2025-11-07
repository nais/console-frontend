import type { UserInfo$result } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { error } from '@sveltejs/kit';
import { get, type Readable } from 'svelte/store';

export async function load(event) {
	const pd = await event.parent();

	const userInfo = get(
		pd.UserInfo as Readable<{
			data?: UserInfo$result | null;
		}>
	);

	if (!(userInfo.data?.me.__typename === 'User' && userInfo.data?.me.isAdmin)) {
		error(403, 'You are not allowed to view this page');
	}

	return {
		...(await addPageMeta(event, {
			title: 'Administration',
			breadcrumbs: [
				{
					label: 'Admin',
					href: '/admin'
				}
			]
		}))
	};
}
