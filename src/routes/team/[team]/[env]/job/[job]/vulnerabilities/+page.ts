import {
	ImageVulnerabilityOrderField,
	load_JobImageDetails,
	load_ImageFindings,
	load_WorkloadFindings,
	OrderDirection
} from '$houdini';
import {
	includeSuppressedWorkloadFindings,
	initialWorkloadFindingsVariables
} from '#lib/domain/vulnerability/workloadFindings.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { get } from 'svelte/store';

export async function load(event) {
	if ((await event.parent()).v0sVulnerabilities) {
		const showSuppressed = includeSuppressedWorkloadFindings(event.url.searchParams);
		return {
			...(await addPageMeta(event, { title: 'Vulnerabilities' })),
			...(await load_WorkloadFindings({
				event,
				blocking: true,
				variables: initialWorkloadFindingsVariables(
					event.params.team,
					event.params.env,
					event.params.job,
					showSuppressed
				)
			})),
			showSuppressed,
			v0sVulnerabilities: true as const
		};
	}
	const details = await load_JobImageDetails({
		event,
		blocking: true,
		variables: {
			team: event.params.team,
			env: event.params.env,
			job: event.params.job
		}
	});
	const workload = get(details.JobImageDetails).data?.team.environment.workload;
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
						workload: event.params.job,
						packageType: null,
						orderBy: {
							field: ImageVulnerabilityOrderField.SEVERITY,
							direction: OrderDirection.DESC
						},
						first: 10,
						after: null,
						before: null,
						last: null
					}
				}).catch((error) => {
					console.error('Unable to load initial job vulnerability findings:', error);
					return { ImageFindings: undefined };
				})
			: { ImageFindings: undefined })
	};
}
