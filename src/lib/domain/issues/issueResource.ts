interface NamedResource {
	name: string;
}

interface IssueResourceData {
	teamEnvironment: {
		environment: { name: string };
		team: { slug: string };
	};
	workload?: NamedResource & { __typename: string };
	application?: NamedResource;
	job?: NamedResource;
	branch?: NamedResource & { postgres: NamedResource };
	sqlInstance?: NamedResource;
	openSearch?: NamedResource;
	valkey?: NamedResource;
	unleash?: NamedResource;
}

export function issueResource(issue: IssueResourceData | null | undefined): {
	name: string;
	href: string | null;
} {
	const env = issue?.teamEnvironment?.environment?.name;
	const team = issue?.teamEnvironment?.team?.slug;
	const href = (path: string) => (team && env ? `/team/${team}/${env}/${path}` : null);

	if (issue?.workload) {
		const type = issue.workload.__typename === 'Application' ? 'app' : 'job';
		return { name: issue.workload.name, href: href(`${type}/${issue.workload.name}`) };
	}
	if (issue?.application) {
		return { name: issue.application.name, href: href(`app/${issue.application.name}`) };
	}
	if (issue?.job) {
		return { name: issue.job.name, href: href(`job/${issue.job.name}`) };
	}
	if (issue?.branch) {
		return {
			name: `${issue.branch.postgres.name} / ${issue.branch.name}`,
			href: href(
				`postgres/${issue.branch.postgres.name}${issue.branch.name === 'main' ? '' : `?branch=${encodeURIComponent(issue.branch.name)}`}`
			)
		};
	}
	if (issue?.sqlInstance) {
		return { name: issue.sqlInstance.name, href: href(`cloudsql/${issue.sqlInstance.name}`) };
	}
	if (issue?.openSearch) {
		return { name: issue.openSearch.name, href: href(`opensearch/${issue.openSearch.name}`) };
	}
	if (issue?.valkey) {
		return { name: issue.valkey.name, href: href(`valkey/${issue.valkey.name}`) };
	}
	if (issue?.unleash) {
		return { name: issue.unleash.name, href: team && env ? `/team/${team}/unleash` : null };
	}
	return { name: 'Unknown', href: null };
}
