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
		case 'confirm_delete':
			return {
				pageName: 'Confirm Team Deletion'
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

export const urlToBreadcrumbs = ({ pathname }: URL): Result[] => {
	const split = pathname.split('/');

	if (split.length < 4) {
		return [];
	}

	// Hack to handle confirm_delete
	if (split[3] == 'settings' && split[4] === 'confirm_delete') {
		return [{ label: split[2], href: `/team/${split[2]}` }];
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

export function pathToFavoriteLabel(path: string): string {
	console.log('pathToFavoriteLabel', path);
	const parts = path.split('/').filter(Boolean);

	if (parts.length < 2 || parts[0] !== 'team') {
		return path;
	}

	const team = parts[1];

	// Case: /team/{team} only
	if (parts.length === 2) {
		return team;
	}

	// Case: /team/{team}/{something} (kan være env eller annen underside)
	if (parts.length === 3) {
		const secondPart = parts[2];
		// Hvis denne matcher et kjent miljø, vis som team · env
		// Her kan du evt ha liste over miljøer, men for enkelhet viser vi alltid som env
		return `${team} · ${capitalize(secondPart)}`;
	}

	// Lengre path med miljø, type osv.
	const env = parts[2];
	const type = parts[3];
	const resource = parts[4] ?? null;
	const subpage = parts[5] ?? null;

	if (type === 'settings' && resource === 'confirm_delete') {
		return `${team} · Confirm Team Deletion`;
	}

	const typeInfo = label(type);

	const labelParts = [team, env];

	if (resource) {
		labelParts.push(typeInfo.pageName);
		labelParts.push(resource);
	} else {
		labelParts.push(typeInfo.pageName);
	}

	if (subpage) {
		const subpageInfo = label(subpage);
		if (subpageInfo.pageName) {
			labelParts.push(subpageInfo.pageName);
		} else {
			labelParts.push(capitalize(subpage));
		}
	}

	return labelParts.join(' · ');
}

function capitalize(str: string): string {
	if (!str) return '';
	return str[0].toUpperCase() + str.slice(1);
}
