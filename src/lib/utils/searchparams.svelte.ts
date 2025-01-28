import { goto } from '$app/navigation';
import { page } from '$app/state';

export const changeParams = (params: Record<string, string>) => {
	const query = new URLSearchParams(page.url.searchParams);
	for (const [key, value] of Object.entries(params)) {
		if (key !== 'environments' && value === '') {
			query.delete(key);
			continue;
		}
		query.set(key, value);
	}
	goto(`?${query.toString()}`);
};
