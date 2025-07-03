import {
	load_OpenSearchInstance,
	OpenSearchAccessOrderField,
	type OpenSearchAccessOrderField$options,
	type OrderDirection$options
} from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_OpenSearchInstance({
			event,
			variables: {
				environment: event.params.env,
				team: event.params.team,
				name: event.params.opensearch,
				orderBy: {
					field: (event.url.searchParams.get('field') ||
						OpenSearchAccessOrderField.WORKLOAD) as OpenSearchAccessOrderField$options,
					direction: (event.url.searchParams.get('direction') || 'ASC') as OrderDirection$options
				}
			}
		}))
	};
};
