import { load_BigQueryDataset } from '$houdini';

export async function load(event) {
	return {
		...(await load_BigQueryDataset({
			event,
			variables: {
				team: event.params.team,
				environment: event.params.env,
				name: event.params.bigquery
			}
		}))
	};
}
