import {
	KafkaTopicOrderField,
	load_KafkaTopics,
	type KafkaTopicOrderField$options,
	type OrderDirection$options
} from '$houdini';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const parent = await event.parent();

	if (parent.UserInfo.data?.features.openSearch.enabled === false) {
		error(404, 'OpenSearch not enabled');
	}

	const field = (url.searchParams.get('field') ||
		KafkaTopicOrderField.NAME) as KafkaTopicOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return {
		...(await load_KafkaTopics({
			event,
			variables: {
				team: event.params.team,
				orderBy: { field: field, direction: direction }
			}
		}))
	};
};
