import type { KafkaTopicOrderField$options, OrderDirection$options } from '$houdini';
import type { KafkaTopicsVariables } from './$houdini';

export const _KafkaTopicsVariables: KafkaTopicsVariables = ({ url }) => {
	const field = (url.searchParams.get('field') || 'NAME') as KafkaTopicOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } };
};
