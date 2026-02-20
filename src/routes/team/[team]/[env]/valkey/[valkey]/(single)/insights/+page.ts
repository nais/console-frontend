import { PrometheusChartQueryInterval } from '$lib/chart/util';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	let interval = (event.url.searchParams.get('interval') || '7d') as PrometheusChartQueryInterval;
	if (!Object.values(PrometheusChartQueryInterval).includes(interval)) {
		interval = '7d';
	}

	const name = event.params.valkey;

	return {
		interval,
		...(await addPageMeta(event, {
			title: name
		}))
	};
}
