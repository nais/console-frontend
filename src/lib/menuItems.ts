export const menuItems = ({
	path,
	features,
	member,
	inventory,
	isAdmin
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
	isAdmin: boolean;
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
		(label: string, pageName?: string, matchSubPath?: string) => {
			const href = pageName ? `${baseUrl}/${pageName}` : baseUrl;
			const { count, badge } = getInventory(pageName);
			const active =
				(matchSubPath && path.startsWith(`/team/${team}/${page}/${matchSubPath}/`)) ||
				pageName === page;

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
			[menuItem(`${workloadType === 'app' ? 'App' : 'Job'} overview`)],
			[
				menuItem('Vulnerability Report', 'vulnerability-report'),
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
		[menuItem('Team overview')],
		[menuItem('Applications', 'applications'), menuItem('Jobs', 'jobs')],
		[
			member && menuItem('Secrets', 'secrets', 'secret'),
			menuItem('Postgres', 'postgres', 'postgres'),
			menuItem('Buckets', 'buckets', 'bucket'),
			features?.redis && menuItem('Redis', 'redis', 'redis'),
			features?.valkey && menuItem('Valkey', 'valkey', 'valkey'),
			features?.openSearch && menuItem('OpenSearch', 'opensearch', 'opensearch'),
			features?.kafka && menuItem('Kafka topics', 'kafka', 'kafka'),
			menuItem('BigQuery', 'bigquery', 'bigquery'),
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
			(member || isAdmin) && menuItem('Settings', 'settings'),
			member && menuItem('Activity log', 'activity-log')
		].filter(Boolean) as { label: string; href: string; active?: boolean }[]
	];
};
