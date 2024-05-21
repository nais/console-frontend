import type { KafkaTopicVariables } from './$houdini';
export const _KafkaTopicVariables: KafkaTopicVariables = ({ params }) => {
	return {
		env: params.env,
		team: params.team,
		name: params.kafka
	};
};
