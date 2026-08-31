import {
	KafkaTopicAclOrderField,
	load_KafkaTopic,
	type KafkaTopicAclOrderField$options
} from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.kafka, docPath: '/persistence/kafka/' })),
		...(await load_KafkaTopic({
			event,
			variables: {
				environment: event.params.env,
				team: event.params.team,
				name: event.params.kafka,
				orderBy: {
					field: Object.values(KafkaTopicAclOrderField).includes(
						event.url.searchParams.get('field') as KafkaTopicAclOrderField$options
					)
						? (event.url.searchParams.get('field') as KafkaTopicAclOrderField$options)
						: KafkaTopicAclOrderField.TEAM_SLUG,
					direction: event.url.searchParams.get('direction') === 'DESC' ? 'DESC' : 'ASC'
				}
			}
		}))
	};
}
