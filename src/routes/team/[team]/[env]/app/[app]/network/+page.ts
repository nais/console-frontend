import { load_IngressMetrics } from '$houdini';
import { PrometheusChartQueryInterval } from '#lib/chart/util.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export const ssr = false;
export async function load(event) {
	let interval = (event.url.searchParams.get('interval') || '7d') as PrometheusChartQueryInterval;
	if (!Object.values(PrometheusChartQueryInterval).includes(interval)) {
		interval = '7d';
	}

	return {
		interval,
		...(await addPageMeta(event, {
			title: 'Network'
		})),
		...(await load_IngressMetrics({
			event,
			variables: {
				app: event.params.app,
				env: event.params.env,
				team: event.params.team
			}
		}))
	};
}
