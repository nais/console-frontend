import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params: { team } }) => {
	redirect(307, `/team/${team}/applications`);
};
