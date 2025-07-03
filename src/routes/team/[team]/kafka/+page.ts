import { KafkaTopicOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$houdini';

const rows = 25;

export const _KafkaTopicsVariables: PageLoad = async (event) => {
	const { url } = event;
	const parent = await event.parent();

	const userInfoData = get(parent.UserInfo);

	if (userInfoData.data?.features.kafka.enabled === false) {
		error(404, 'Kafka not enabled');
	}

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		orderBy: {
			field: urlToOrderField(KafkaTopicOrderField, KafkaTopicOrderField.NAME, url),
			direction: urlToOrderDirection(url)
		},
		...(before ? { before, last: rows } : { after, first: rows })
	};
};
