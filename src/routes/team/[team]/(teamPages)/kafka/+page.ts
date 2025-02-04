import {
	KafkaTopicOrderField,
	load_KafkaTopics,
	type KafkaTopicOrder,
	type KafkaTopicOrderField$options,
	type OrderDirection$options
} from '$houdini';
import { error } from '@sveltejs/kit';
import type { AfterLoadEvent, PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const parent = await event.parent();

	if (parent.UserInfo.data?.features.kafka.enabled === false) {
		error(404, 'Kafka not enabled');
	}

	const field = (url.searchParams.get('field') ||
		KafkaTopicOrderField.NAME) as KafkaTopicOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;
	const rows: number = parseInt(url.searchParams.get('rows') || '10');

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		...(await load_KafkaTopics({
			event,
			variables: {
				team: event.params.team,
				orderBy: { field: field, direction: direction } as KafkaTopicOrder,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
};

export function _houdini_afterLoad({ data }: AfterLoadEvent) {
	return {
		data
	};
}
