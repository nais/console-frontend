import {
	KafkaTopicAclOrderField,
	type KafkaTopicAclOrderField$options,
	type OrderDirection$options
} from '$houdini';
import type { KafkaTopicVariables } from './$houdini';

export const _KafkaTopicVariables: KafkaTopicVariables = ({ url, params }) => {
	console.log('params', params);
	const field = (url.searchParams.get('field') ||
		KafkaTopicAclOrderField.TEAM_SLUG) as KafkaTopicAclOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return {
		orderBy: { field: field, direction: direction },
		environment: params.env,
		team: params.team,
		name: params.kafka
	};
};
