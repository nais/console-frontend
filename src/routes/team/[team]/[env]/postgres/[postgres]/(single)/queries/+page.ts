import {
	load_PostgresInsights,
	load_PostgresQueryStatistics,
	PostgresQueryStatisticsStore
} from '$houdini';
import { PrometheusChartQueryInterval } from '#lib/chart/util.js';
import { postgresQueryInsightsQuery } from '#lib/domain/postgres/queryInsights.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { requireMainBranch } from '#lib/domain/postgres/branchCompatibility.js';

export const load: PageLoad = async (event) => {
	requireMainBranch(event.url);
	const requestedInterval = event.url.searchParams.get('interval');
	const interval =
		Object.values(PrometheusChartQueryInterval).find((value) => value === requestedInterval) ??
		PrometheusChartQueryInterval.OneHour;
	const insights = await load_PostgresInsights({
		event,
		blocking: true,
		variables: {
			team: event.params.team,
			env: event.params.env,
			name: event.params.postgres
		}
	});
	const postgres = get(insights.PostgresInsights).data?.team.environment.postgres;
	const collectedAt = new Date();

	return {
		...(await addPageMeta(event, { title: 'Queries', pageHeaderTitle: event.params.postgres })),
		...insights,
		interval,
		collectedAt,
		...(postgres && !get(insights.PostgresInsights).errors
			? await load_PostgresQueryStatistics({
					event,
					blocking: true,
					variables: {
						environmentName: event.params.env,
						input: {
							time: collectedAt,
							query: postgresQueryInsightsQuery(event.params.team, event.params.postgres, interval)
						}
					}
				})
			: { PostgresQueryStatistics: new PostgresQueryStatisticsStore() })
	};
};
