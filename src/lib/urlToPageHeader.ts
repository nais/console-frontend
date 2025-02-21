const label = (type: string) => {
	switch (type) {
		case 'job':
			return {
				pageName: 'Jobs',
				plural: 'jobs'
			};
		case 'app':
			return {
				pageName: 'Applications',
				plural: 'applications'
			};
		case 'secret':
			return {
				pageName: 'Secrets',
				plural: 'secrets'
			};
		case 'postgres':
			return {
				pageName: 'Postgres instances',
				plural: 'postgres'
			};
		case 'bucket':
			return {
				pageName: 'Buckets',
				plural: 'buckets'
			};
		case 'redis':
			return {
				pageName: 'Redis instances',
				plural: 'redis'
			};
		case 'valkey':
			return {
				pageName: 'Valkey instances',
				plural: 'valkey'
			};
		case 'opensearch':
			return {
				pageName: 'OpenSearch instances',
				plural: 'opensearch'
			};
		case 'kafka':
			return {
				pageName: 'Kafka topics',
				plural: 'kafka'
			};
		case 'bigquery':
			return {
				pageName: 'BigQuery datasets',
				plural: 'bigquery'
			};
		case 'deploy':
		case 'deploys':
			return {
				pageName: 'Deployments'
			};
		case 'activity-log':
			return {
				pageName: 'Activity log'
			};
		default:
			return {
				pageName: type ? type[0].toUpperCase() + type.slice(1) : ''
			};
	}
};

type Result = {
	label: string;
	href?: string;
};

const urlToBreadcrumbs = ({ pathname }: URL): Result[] => {
	const split = pathname.split('/');

	if (split.length < 4) {
		return [];
	}

	const [, , team, env, type, resource] = split;

	let res: Result[] = [{ label: team, href: `/team/${team}` }];

	if (split.length === 4) {
		return res;
	}

	const { pageName, plural } = label(type);

	res = [...res, { label: env }, { label: pageName, href: `/team/${team}/${plural}` }];

	if (split.length === 6) {
		return res;
	}

	return [...res, { label: resource, href: `/team/${team}/${env}/${type}/${resource}` }];
};

export const urlToPageHeader = (url: URL): { breadcrumbs: Result[]; heading: string } => {
	const split = url.pathname.split('/');

	return {
		breadcrumbs: urlToBreadcrumbs(url),
		heading:
			([3, 6].includes(split.length) ? split.at(-1) : label(split.at(-1) ?? '').pageName) ?? ''
	};
};
