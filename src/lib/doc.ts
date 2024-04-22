import { page } from '$app/stores';
import { get } from 'svelte/store';

export const docURL = (path: string = '') => {
	const tn = get(page).data.tenantName;
	if (!tn || tn == 'nav') {
		return `https://docs.nais.io${path}`;
	}

	return `https://docs.${tn}.cloud.nais.io${path}`;
};
