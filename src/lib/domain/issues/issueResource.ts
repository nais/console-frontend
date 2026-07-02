import type { Severity$options } from '$houdini';

type NamedResource = {
	name: string;
};

type WorkloadResource = NamedResource & {
	__typename: string;
};

type ApplicationResource = NamedResource & {
	__typename: 'Application';
};

export type IssueDisplayData = {
	id: string;
	__typename: string;
	message: string;
	severity: Severity$options;
	teamEnvironment: {
		environment: {
			name: string;
		};
		team?: {
			slug: string;
		};
	};
	workload?: WorkloadResource;
	application?: ApplicationResource;
	job?: NamedResource;
	sqlInstance?: NamedResource;
	openSearch?: NamedResource;
	valkey?: NamedResource;
	unleash?: NamedResource;
	ingresses?: string[];
	cvssScore?: number;
};

export type IssueResourceKind =
	| 'app'
	| 'job'
	| 'database'
	| 'opensearch'
	| 'valkey'
	| 'unleash'
	| 'other';

type IssueWorkload = {
	__typename: string;
	name: string;
};

export type IssueResource = {
	name: string;
	kind: IssueResourceKind;
	workload: IssueWorkload | null;
};

function getIssueWorkload(issue: IssueDisplayData): IssueWorkload | null {
	if (issue.workload) {
		return issue.workload;
	}

	if (issue.application) {
		return issue.application;
	}

	return null;
}

export function getIssueResource(issue: IssueDisplayData): IssueResource {
	const workload = getIssueWorkload(issue);

	if (workload) {
		return {
			name: workload.name,
			kind: workload.__typename === 'Application' ? 'app' : 'job',
			workload
		};
	}

	if (issue.job) {
		return {
			name: issue.job.name,
			kind: 'job',
			workload: null
		};
	}

	if (issue.sqlInstance) {
		return {
			name: issue.sqlInstance.name,
			kind: 'database',
			workload: null
		};
	}

	if (issue.openSearch) {
		return {
			name: issue.openSearch.name,
			kind: 'opensearch',
			workload: null
		};
	}

	if (issue.valkey) {
		return {
			name: issue.valkey.name,
			kind: 'valkey',
			workload: null
		};
	}

	if (issue.unleash) {
		return {
			name: issue.unleash.name,
			kind: 'unleash',
			workload: null
		};
	}

	return {
		name: 'Unknown',
		kind: 'other',
		workload: null
	};
}
