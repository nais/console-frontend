import { page } from '$app/state';

export const docURL = (path: string = '') => {
	const tn = page.data.tenantName;
	if (!tn || tn == 'nav') {
		return `https://docs.nais.io${path}`;
	}

	return `https://docs.${tn}.cloud.nais.io${path}`;
};

export const tenantURL = (host: string, path: string = '') => {
	const tn = page.data.tenantName || 'nav';

	return `https://${host}.${tn}.cloud.nais.io${path}`;
};

export const apmURL = (namespace: string, service: string, tab?: string) => {
	const params = tab ? `?tab=${tab}` : '';
	return tenantURL('grafana', `/a/nais-apm-app/services/${namespace}/${service}${params}`);
};

export const apmNamespaceURL = (namespace: string) => {
	return tenantURL('grafana', `/a/nais-apm-app/namespaces/${namespace}`);
};

export const apmServicesURL = () => {
	return tenantURL('grafana', '/a/nais-apm-app/services');
};
