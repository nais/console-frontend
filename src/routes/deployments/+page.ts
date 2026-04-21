import type { DeploymentFilter } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { subDays, subMonths } from 'date-fns';
import { DeploymentsMetadataQuery, TenantDeploymentsQuery } from './deployments';

const rows = 25;

const intervalOptions = ['7d', '30d', '6m', 'all'] as const;
type Interval = (typeof intervalOptions)[number];

function getFromDate(interval: Interval): Date | null {
	const now = new Date();
	switch (interval) {
		case '6m':
			return subMonths(now, 6);
		case '30d':
			return subDays(now, 30);
		case '7d':
			return subDays(now, 7);
		case 'all':
			return null;
		default:
			return subDays(now, 7);
	}
}

export async function load(event) {
	const intervalParam = event.url.searchParams.get('interval') as Interval | null;
	const interval = intervalParam && intervalOptions.includes(intervalParam) ? intervalParam : '7d';
	const from = getFromDate(interval);
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',') || undefined;

	const filter: DeploymentFilter = {
		...(from ? { from: from.toISOString() } : {}),
		...(environments ? { environments } : {})
	};

	const [TenantDeployments, DeploymentsMetadata] = await Promise.all([
		runQuery(event, TenantDeploymentsQuery, {
			...readCursorPagination(event.url, rows),
			...(Object.keys(filter).length > 0 ? { filter } : {})
		}),
		runQuery(event, DeploymentsMetadataQuery, {})
	]);

	return {
		...(await addPageMeta(event, { title: 'Tenant Deployments' })),
		TenantDeployments,
		DeploymentsMetadata
	};
}
