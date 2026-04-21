import { KafkaTopicAclOrderField, OrderDirection } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { KafkaTopicQuery } from './kafka';

const rows = 10;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.kafka })),
		KafkaTopic: await runQuery(event, KafkaTopicQuery, {
			environment: event.params.env,
			team: event.params.team,
			name: event.params.kafka,
			orderBy: {
				field:
					(event.url.searchParams.get('field') as KafkaTopicAclOrderField | null) ??
					KafkaTopicAclOrderField.TEAM_SLUG,
				direction:
					(event.url.searchParams.get('direction') as OrderDirection | null) ?? OrderDirection.ASC
			},
			...readCursorPagination(event.url, rows)
		})
	};
}
