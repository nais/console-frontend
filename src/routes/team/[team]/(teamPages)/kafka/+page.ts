import {
	KafkaTopicOrderField,
	type KafkaTopicOrderField$options,
	type OrderDirection$options
} from '$houdini';
import type { KafkaTopicsVariables } from './$houdini';

export const _KafkaTopicsVariables: KafkaTopicsVariables = ({ url }) => {
	const field = (url.searchParams.get('field') ||
		KafkaTopicOrderField.NAME) as KafkaTopicOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } };
};
