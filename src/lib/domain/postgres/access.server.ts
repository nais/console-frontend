import { graphql } from '$houdini';
import { error, type RequestEvent } from '@sveltejs/kit';

const access = graphql(`
	query PostgresManagementAccess($team: Slug!) {
		me {
			... on User {
				isAdmin
			}
		}
		team(slug: $team) {
			viewerIsMember
		}
	}
`);

export async function requirePostgresAccess(event: RequestEvent, team: string) {
	const result = await access.fetch({ event, variables: { team }, policy: 'NetworkOnly' });
	if (result.errors?.length) {
		error(500, result.errors.map((item) => item.message).join('. '));
	}
	if (!result.data) {
		error(500, 'Could not verify permission to manage Postgres.');
	}
	if (
		!result.data.team.viewerIsMember &&
		!(result.data.me.__typename === 'User' && result.data.me.isAdmin)
	) {
		error(403, 'You do not have permission to manage Postgres for this team.');
	}
}
