import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { ResourceUtilizationForAppQuery } from './utilization';

function getStart(interval: string | null) {
	switch (interval) {
		case '1h':
			return new Date(Date.now() - 1000 * 60 * 60);
		case '6h':
			return new Date(Date.now() - 6 * 1000 * 60 * 60);
		case '1d':
			return new Date(Date.now() - 24 * 1000 * 60 * 60);
		case '30d':
			return new Date(Date.now() - 30 * 24 * 1000 * 60 * 60);
		default:
			return new Date(Date.now() - 7 * 24 * 1000 * 60 * 60);
	}
}

export const ssr = false;
export async function load(event) {
	const interval = event.url.searchParams.get('interval');
	const end = new Date(Date.now());
	const start = getStart(interval);

	return {
		interval,
		// Keep the JS `Date` instances around for the chart's xDomain — the
		// previous Houdini-based component read them off the operation's
		// `variables`, but with urql we just thread them through `data`.
		start,
		end,
		...(await addPageMeta(event, {
			title: 'Utilization'
		})),
		// `Time` scalar is an ISO-8601 string on the wire. Houdini auto-formatted
		// JS `Date` instances; with urql we serialize explicitly.
		ResourceUtilizationForApp: await runQuery(event, ResourceUtilizationForAppQuery, {
			app: event.params.app,
			env: event.params.env,
			team: event.params.team,
			start: start.toISOString(),
			end: end.toISOString()
		})
	};
}
