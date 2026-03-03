import {
	KafkaTopicAclOrderField,
	load_KafkaTopic,
	type KafkaTopicAclOrderField$options,
	type OrderDirection$options
} from '$houdini';
import { PrometheusChartQueryInterval } from '$lib/chart/util';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	let interval = (event.url.searchParams.get('interval') || '7d') as PrometheusChartQueryInterval;
	if (!Object.values(PrometheusChartQueryInterval).includes(interval)) {
		interval = '7d';
	}

	return {
		interval,
		...(await addPageMeta(event, { title: 'Insights' })),
		...(await load_KafkaTopic({
			event,
			variables: {
				environment: event.params.env,
				team: event.params.team,
				name: event.params.kafka,
				orderBy: {
					field: (event.url.searchParams.get('field') ||
						KafkaTopicAclOrderField.TEAM_SLUG) as KafkaTopicAclOrderField$options,
					direction: (event.url.searchParams.get('direction') || 'ASC') as OrderDirection$options
				}
			}
		}))
	};
}
