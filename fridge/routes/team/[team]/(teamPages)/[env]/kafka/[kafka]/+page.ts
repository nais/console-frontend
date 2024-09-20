import { error } from '@sveltejs/kit';
import type { KafkaTopicVariables } from './$houdini';

export const _KafkaTopicVariables: KafkaTopicVariables = ({ url, params }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	if (!page || page < 1) {
		error(400, 'Bad pagenumber');
	}
	const limit = 10;
	const offset = (page - 1) * limit;
	const field = (url.searchParams.get('col') || 'NAME') as never;
	const direction = (url.searchParams.get('dir') || 'ASC') as never;

	return {
		limit,
		offset,
		orderBy: { field, direction },
		env: params.env,
		team: params.team,
		name: params.kafka
	};
};
