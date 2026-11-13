import {
	ImageVulnerabilityOrderField,
	load_ApplicationImageDetails,
	load_ImagePriorityVulnerabilities,
	OrderDirection
} from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { get } from 'svelte/store';

const rows = 10;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const details = await load_ApplicationImageDetails({
		event,
		blocking: true,
		variables: {
			team: event.params.team,
			env: event.params.env,
			app: event.params.app,
			...(before ? { before, last: rows } : { after, first: rows })
		}
	});
	const workload = get(details.ApplicationImageDetails).data?.team.environment.workload;
	const image = workload && 'image' in workload ? workload.image : undefined;
	const hasFindings =
		image?.vulnerabilitySummary &&
		(image.sbom.status === 'READY' || image.sbom.status === 'PROCESSING');
	return {
		...(await addPageMeta(event, { title: 'Vulnerabilities' })),
		...details,
		initialFindingsStatus: image?.sbom.status,
		...(hasFindings
			? await load_ImagePriorityVulnerabilities({
					event,
					blocking: true,
					variables: {
						team: event.params.team,
						environment: event.params.env,
						workload: event.params.app,
						priorities: null,
						packageType: null,
						orderBy: {
							field: ImageVulnerabilityOrderField.SEVERITY,
							direction: OrderDirection.DESC
						},
						first: rows,
						after: null,
						before: null,
						last: null
					}
				})
			: { ImagePriorityVulnerabilities: undefined })
	};
}
