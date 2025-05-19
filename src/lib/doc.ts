import { page } from '$app/state';

export const docURL = (path: string = '') => {
	const tn = page.data.tenantName;
	if (!tn || tn == 'nav') {
		return `https://docs.nais.io${path}`;
	}

	return `https://docs.${tn}.cloud.nais.io${path}`;
};

export const tenantURL = (host: string, path: string = '') => {
	const tn = page.data.tenantName;

	return `https://${host}.${tn}.cloud.nais.io${path}`;
};
