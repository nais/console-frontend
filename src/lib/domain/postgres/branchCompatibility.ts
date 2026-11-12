import { error } from '@sveltejs/kit';

/** Old main links remain valid; never silently display main for another database. */
export function requireMainBranch(url: URL) {
	if (url.searchParams.getAll('branch').some((branch) => branch !== 'main')) {
		error(
			400,
			'Postgres branching has been retired. Only main is supported; this link refers to a different database branch.'
		);
	}
}
