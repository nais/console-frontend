import type { HomeActivity$result, HomeAttention$result } from '$houdini';
import { issueResource } from '#lib/domain/issues/issueResource.js';
import type { Exhaustive } from '#lib/utils/houdini.js';

export type HomeIssue = Exhaustive<HomeAttention$result['issues']['nodes'][number]>;
export type HomeActivityEntry = Exhaustive<HomeActivity$result['activityLog']['nodes'][number]>;

export function homeIssueResource(issue: HomeIssue) {
	if ('workload' in issue) {
		const workload = issue.workload;
		return issueResource({
			...issue,
			workload:
				workload.__typename === 'Application' || workload.__typename === 'Job'
					? workload
					: undefined
		});
	}
	return issueResource(issue);
}

export function homeActivityTeam(entry: HomeActivityEntry) {
	return 'teamSlug' in entry ? entry.teamSlug : entry.optionalTeamSlug;
}

export function homeActivityHref(entry: HomeActivityEntry) {
	const team = homeActivityTeam(entry);
	const params = new URLSearchParams({ id: entry.id, resourceTypes: entry.resourceType });
	if (entry.environmentName) params.set('environments', entry.environmentName);
	return team ? `/team/${team}/activity-log?${params}` : `/activity-log?${params}`;
}

export function filterHomeTeams<T extends { slug: string; purpose: string | null }>(
	teams: readonly T[],
	filter: string
) {
	const query = filter.trim().toLowerCase();
	return teams.filter(
		(team) => team.slug.toLowerCase().includes(query) || team.purpose?.toLowerCase().includes(query)
	);
}
