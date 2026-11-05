import {
	load_HomeActivity,
	load_HomeAttention,
	load_HomeTeamSummaries,
	load_UserTeams
} from '$houdini';
import { get } from 'svelte/store';

async function loadSection<T>(name: string, loader: () => Promise<T>) {
	try {
		return { result: await loader(), error: null };
	} catch (error) {
		console.error(`Unable to load home ${name}:`, error);
		return { result: null, error: `Unable to load ${name}. Try refreshing the page.` };
	}
}

export async function load(event) {
	const teams = await loadSection('your teams', () => load_UserTeams({ event, blocking: true }));
	const memberships = teams.result ? get(teams.result.UserTeams) : null;
	const me = memberships?.data?.me;
	const teamSlugs =
		me?.__typename === 'User' ? me.teams.edges.map(({ node }) => node.team.slug) : [];
	const noMemberships =
		!memberships?.errors?.length && me?.__typename === 'User' && me.teams.pageInfo.totalCount === 0;
	const skipped = { result: null, error: null };
	const [attention, activity, summaries] = await Promise.all([
		noMemberships
			? skipped
			: loadSection('attention items', () => load_HomeAttention({ event, blocking: true })),
		noMemberships
			? skipped
			: loadSection('recent activity', () =>
					load_HomeActivity({
						event,
						blocking: true,
						variables: { from: event.data.homeActivityFrom }
					})
				),
		teamSlugs.length
			? loadSection('team summaries', () =>
					load_HomeTeamSummaries({ event, blocking: true, variables: { teamSlugs } })
				)
			: skipped
	]);

	return {
		UserTeams: teams.result?.UserTeams ?? null,
		HomeAttention: attention.result?.HomeAttention ?? null,
		HomeActivity: activity.result?.HomeActivity ?? null,
		HomeTeamSummaries: summaries.result?.HomeTeamSummaries ?? null,
		homeLoadErrors: {
			teams: teams.error,
			attention: attention.error,
			activity: activity.error,
			summaries: summaries.error
		}
	};
}
