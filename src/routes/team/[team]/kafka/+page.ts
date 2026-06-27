import { KafkaTopicOrderField, load_KafkaTopics } from '$houdini';
import type { KafkaTopicFilter } from '$houdini/graphql/inputs';
import { parseLabelsParam } from '$lib/domain/labels/labels';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const envParam = event.url.searchParams.get('environments')?.split(',').filter(Boolean);
	const environments = envParam?.length ? envParam : undefined;
	const poolsParam = event.url.searchParams.get('pools')?.split(',').filter(Boolean);
	const pools = poolsParam?.length ? poolsParam : undefined;
	const labels = parseLabelsParam(event.url.searchParams.get('labels'));

	return {
		...(await addPageMeta(event, {
			title: 'Kafka Topics',
			pageHeaderTitle: '',
			docPath: '/persistence/kafka'
		})),
		...(await load_KafkaTopics({
			event,
			variables: {
				team: event.params.team,
				filter: { environments, pools, labels } as KafkaTopicFilter,
				orderBy: {
					field: urlToOrderField(KafkaTopicOrderField, KafkaTopicOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
