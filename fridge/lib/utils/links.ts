export const resourceLink = (env: string, team: string, resource: string, name: string): string =>
	`/team/${team}/${env}/${resource}/${name}`;
