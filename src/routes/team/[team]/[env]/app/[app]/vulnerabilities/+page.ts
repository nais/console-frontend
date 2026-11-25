import {
	ImageVulnerabilityOrderField,
	load_ApplicationImageDetails,
	load_ImageFindings,
	load_WorkloadFindings,
	OrderDirection
} from '$houdini';
import { initialWorkloadFindingsVariables } from '#lib/domain/vulnerability/workloadFindings.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { get } from 'svelte/store';

const rows = 10;

export async function load(event) {
	if ((await event.parent()).v0sVulnerabilities) {
		return {
			...(await addPageMeta(event, { title: 'Vulnerabilities' })),
			...(await load_WorkloadFindings({
				event,
				blocking: true,
				variables: initialWorkloadFindingsVariables(
					event.params.team,
					event.params.env,
					event.params.app
				)
			})),
			v0sVulnerabilities: true as const
		};
	}
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
		v0sVulnerabilities: false as const,
		initialFindingsStatus: image?.sbom.status,
		...(hasFindings
			? await load_ImageFindings({
					event,
					blocking: true,
					variables: {
						team: event.params.team,
						environment: event.params.env,
						workload: event.params.app,
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
				}).catch((error) => {
					console.error('Unable to load initial application vulnerability findings:', error);
					return { ImageFindings: undefined };
				})
			: { ImageFindings: undefined })
	};
}
