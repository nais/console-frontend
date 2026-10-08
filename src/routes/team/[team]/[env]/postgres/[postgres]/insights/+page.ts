import { load_PostgresInsights } from '$houdini';
import { PrometheusChartQueryInterval } from '#lib/chart/util.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	let interval = (event.url.searchParams.get('interval') || '7d') as PrometheusChartQueryInterval;
	if (!Object.values(PrometheusChartQueryInterval).includes(interval)) {
		interval = '7d';
	}

	return {
		interval,
		...(await addPageMeta(event, { title: 'Insights' })),
		...(await load_PostgresInsights({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				env: event.params.env,
				name: event.params.postgres
			}
		}))
	};
}
