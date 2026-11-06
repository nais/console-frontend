import { requireMainBranch } from '#lib/domain/postgres/branchCompatibility.js';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	requireMainBranch(url);
	const target = new URL(url);
	target.pathname = target.pathname.replace(/\/branches\/?$/, '');
	target.searchParams.delete('branch');
	redirect(307, `${target.pathname}${target.search}${target.hash}`);
};
