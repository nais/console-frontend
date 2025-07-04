import {
	KafkaTopicAclOrderField,
	load_KafkaTopic,
	type KafkaTopicAclOrderField$options,
	type OrderDirection$options
} from '$houdini';

export async function load(event) {
	return {
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
