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

export const load: PageLoad = async (event) => {
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
	const branch = postgres?.activeBranch?.name ?? '';
	const collectedAt = new Date();

	return {
		...(await addPageMeta(event, { title: 'Queries', pageHeaderTitle: event.params.postgres })),
		...insights,
		interval,
		branch,
		collectedAt,
		...(postgres && branch && !get(insights.PostgresInsights).errors
			? await load_PostgresQueryStatistics({
					event,
					blocking: true,
					variables: {
						environmentName: event.params.env,
						input: {
							time: collectedAt,
							query: postgresQueryInsightsQuery(
								event.params.team,
								event.params.postgres,
								branch,
								interval
							)
						}
					}
				})
			: { PostgresQueryStatistics: new PostgresQueryStatisticsStore() })
	};
};
