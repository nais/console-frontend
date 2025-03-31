import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';
import { envTagVariant } from './envTagVariant';

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
				pageName: 'Postgres Instances',
				plural: 'postgres'
			};
		case 'bucket':
			return {
				pageName: 'Buckets',
				plural: 'buckets'
			};
		case 'valkey':
			return {
				pageName: 'Valkey Instances',
				plural: 'valkey'
			};
		case 'opensearch':
			return {
				pageName: 'OpenSearch Instances',
				plural: 'opensearch'
			};
		case 'kafka':
			return {
				pageName: 'Kafka Topics',
				plural: 'kafka'
			};
		case 'bigquery':
			return {
				pageName: 'BigQuery Datasets',
				plural: 'bigquery'
			};
		case 'deploy':
		case 'deploys':
			return {
				pageName: 'Deployments'
			};
		case 'activity-log':
			return {
				pageName: 'Activity Log'
			};
		case 'vulnerability-report':
			return {
				pageName: 'Vulnerability Report'
			};
		default:
			return {
				pageName: type
					? type
							.split(' ')
							.map((word) => word[0].toUpperCase() + word.slice(1))
							.join(' ')
					: ''
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

	res = [...res, { label: pageName, href: `/team/${team}/${plural}` }];

	if (split.length === 6) {
		return res;
	}

	return [...res, { label: resource, href: `/team/${team}/${env}/${type}/${resource}` }];
};

export const urlToPageHeader = (
	url: URL
): {
	breadcrumbs: Result[];
	heading: string;
	tag?: { label: string; variant: TagProps['variant'] };
} => {
	const split = url.pathname.split('/');

	return {
		breadcrumbs: urlToBreadcrumbs(url),
		heading:
			([3, 6].includes(split.length) ? split.at(-1) : label(split.at(-1) ?? '').pageName) ?? '',
		...(split.length > 5 ? { tag: { label: split[3], variant: envTagVariant(split[3]) } } : {})
	};
};
