import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

export const changeParams = (params: Record<string, string>) => {
	const query = new URLSearchParams(get(page).url.searchParams);
	for (const [key, value] of Object.entries(params)) {
		if (value === '') {
			query.delete(key);
			continue;
		}
		query.set(key, value);
	}
	goto(`?${query.toString()}`);
};
