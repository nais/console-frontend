import { describe, expect, it } from 'vitest';
import { silenceFilter } from './silenceFilter.js';

describe('silenceFilter', () => {
	it.each([
		['dev-gcp', 'nav', 'dev'],
		['prod-gcp', 'nav', 'prod'],
		['dev-fss', 'nav', 'dev-fss'],
		['prod-fss', 'nav', 'prod-fss'],
		['dev-gcp', 'other-tenant', 'dev-gcp'],
		['sandbox', 'other-tenant', 'sandbox']
	])('maps %s for %s to %s', (environment, tenant, cluster) => {
		expect(silenceFilter('PodRestarts', 'my-team', environment, tenant)).toBe(
			`{alertname="PodRestarts",namespace="my-team",k8s_cluster_name="${cluster}"}`
		);
	});

	it('escapes label values and preserves them through URL encoding', () => {
		const filter = silenceFilter('Alert "name" \\ path\n', 'my-team', 'dev-gcp', 'nav');
		expect(filter).toBe(
			'{alertname="Alert \\"name\\" \\\\ path\\n",namespace="my-team",k8s_cluster_name="dev"}'
		);
		expect(decodeURIComponent(encodeURIComponent(filter))).toBe(filter);
	});
});
