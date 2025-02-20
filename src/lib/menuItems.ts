export const menuItems = ({
	path,
	features,
	member,
	inventory
}: {
	path: string;
	features?: {
		unleash: { enabled: boolean };
		redis: { enabled: boolean };
		valkey: { enabled: boolean };
		kafka: { enabled: boolean };
		openSearch: { enabled: boolean };
	};
	member: boolean;
	inventory?: {
		applications: { total: number; notNais: number };
		jobs: { total: number; notNais: number };
		sqlInstances: { total: number };
		buckets: { total: number };
		redisInstances: { total: number };
		valkeyInstances: { total: number };
		openSearchInstances: { total: number };
		kafkaTopics: { total: number };
		bigQueryDatasets: { total: number };
	};
}): { label: string; href: string; active?: boolean; count?: number; badge?: boolean }[][] => {
	const split = path.split('/');

	const getInventory = (pageName?: string) => {
		const pageNameToInventory = {
			applications: 'applications',
			jobs: 'jobs',
			postgres: 'sqlInstances',
			buckets: 'buckets',
			redis: 'redisInstances',
			valkey: 'valkeyInstances',
			opensearch: 'openSearchInstances',
			kafka: 'kafkaTopics',
			bigquery: 'bigQueryDatasets'
		} as const;

		if (pageName === 'applications' || pageName === 'jobs') {
			const { total, notNais } = inventory?.[pageName] ?? {};
			return {
				count: total,
				badge: notNais ? true : false
			};
		}
		return {
			count: inventory?.[pageNameToInventory[pageName as keyof typeof pageNameToInventory]]?.total,
			badge: false
		};
	};

	const item =
		(baseUrl: string, page: string) =>
		(label: string, pageName?: string, matcher?: (url: string) => boolean) => {
			const href = pageName ? `${baseUrl}/${pageName}` : baseUrl;
			const { count, badge } = getInventory(pageName);
			const active = matcher?.(path) || pageName === page;
			return {
				label,
				href,
				...(active ? { active } : {}),
				...(count ? { count } : {}),
				...(badge ? { badge } : {})
			};
		};
	if (['app', 'job'].includes(split[4])) {
		const [, , team, env, workloadType, name, page] = split;
		const menuItem = item(`/team/${team}/${env}/${workloadType}/${name}`, page);
		return [
			[menuItem('Overview'), menuItem('Status', 'status')],
			[
				menuItem('Image', 'image'),
				menuItem('Deployments', 'deploys'),
				menuItem('Cost', 'cost'),
				workloadType === 'app' && menuItem('Utilization', 'utilization'),
				menuItem('Logs', 'logs')
			].filter(Boolean),
			[menuItem('Manifest', 'manifest')],
			member && [menuItem('Delete', 'delete')]
		].filter(Boolean) as { label: string; href: string; active?: boolean }[][];
	}
	const [, , team, page] = split;
	const menuItem = item(`/team/${team}`, page);
	return [
		[menuItem('Overview')],
		[menuItem('Applications', 'applications'), menuItem('Jobs', 'jobs')],
		[
			member &&
				menuItem('Secrets', 'secrets', (url) => url.startsWith(`/team/${team}/${page}/secret/`)),
			menuItem('Postgres', 'postgres'),
			menuItem('Buckets', 'buckets'),
			features?.redis && menuItem('Redis', 'redis'),
			features?.valkey && menuItem('Valkey', 'valkey'),
			features?.openSearch && menuItem('OpenSearch', 'opensearch'),
			features?.kafka && menuItem('Kafka topics', 'kafka'),
			menuItem('BigQuery', 'bigquery'),
			features?.unleash && menuItem('Unleash', 'unleash')
		].filter(Boolean) as { label: string; href: string; active?: boolean }[],
		[
			menuItem('Deployments', 'deploy'),
			menuItem('Cost', 'cost'),
			menuItem('Utilization', 'utilization'),
			menuItem('Vulnerabilities', 'vulnerabilities')
		],
		[
			menuItem('Members', 'members'),
			menuItem('Repositories', 'repositories'),
			member && menuItem('Settings', 'settings'),
			member && menuItem('Activity log', 'activity-log')
		].filter(Boolean) as { label: string; href: string; active?: boolean }[]
	];
};
