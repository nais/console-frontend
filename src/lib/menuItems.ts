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
		valkey: { enabled: boolean };
		kafka: { enabled: boolean };
		openSearch: { enabled: boolean };
	};
	member: boolean;
	inventory?: {
		applications: { total: number };
		jobs: { total: number };
		sqlInstances: { total: number };
		buckets: { total: number };
		valkeys: { total: number };
		openSearches: { total: number };
		kafkaTopics: { total: number };
		bigQueryDatasets: { total: number };
	};
	isAdmin: boolean;
}): { label: string; href: string; active?: boolean; count?: number }[][] => {
	const split = path.split('/');

	const getInventory = (pageName?: string) => {
		const pageNameToInventory = {
			applications: 'applications',
			jobs: 'jobs',
			postgres: 'sqlInstances',
			buckets: 'buckets',
			valkey: 'valkeys',
			opensearch: 'openSearches',
			kafka: 'kafkaTopics',
			bigquery: 'bigQueryDatasets'
		} as const;

		if (pageName === 'applications' || pageName === 'jobs') {
			const { total } = inventory?.[pageName] ?? {};
			return {
				count: total
			};
		}
		return {
			count: inventory?.[pageNameToInventory[pageName as keyof typeof pageNameToInventory]]?.total
		};
	};

	const item =
		(baseUrl: string, page: string) =>
		(label: string, pageName?: string, matchSubPath?: string) => {
			const href = pageName ? `${baseUrl}/${pageName}` : baseUrl;
			const { count } = getInventory(pageName);
			const active =
				(matchSubPath && path.startsWith(`/team/${team}/${page}/${matchSubPath}/`)) ||
				pageName === page;

			return {
				label,
				href,
				...(active ? { active } : {}),
				...(count ? { count } : {})
			};
		};
	if (['app', 'job'].includes(split[4])) {
		const [, , team, env, workloadType, name, page] = split;
		const menuItem = item(`/team/${team}/${env}/${workloadType}/${name}`, page);
		return [
			[menuItem(`${workloadType === 'app' ? 'App' : 'Job'} Overview`)],
			[
				menuItem('Vulnerability Report', 'vulnerability-report'),
				menuItem('Deployments', 'deploys'),
				menuItem('Cost', 'cost'),
				workloadType === 'app' && menuItem('Utilization', 'utilization'),
				workloadType === 'app' && menuItem('Ingresses', 'ingresses'),
				menuItem('Logs', 'logs')
			].filter(Boolean),
			[menuItem('Manifest', 'manifest')],
			member && [menuItem('Delete', 'delete')]
		].filter(Boolean) as { label: string; href: string; active?: boolean }[][];
	}
	const [, , team, page] = split;
	const menuItem = item(`/team/${team}`, page);
	return [
		[menuItem('Team Overview')],
		[menuItem('Applications', 'applications'), menuItem('Jobs', 'jobs')],
		[
			member && menuItem('Secrets', 'secrets', 'secret'),
			menuItem('Postgres', 'postgres', 'postgres'),
			menuItem('Buckets', 'buckets', 'bucket'),
			features?.valkey && menuItem('Valkey', 'valkey', 'valkey'),
			features?.openSearch && menuItem('OpenSearch', 'opensearch', 'opensearch'),
			features?.kafka && menuItem('Kafka Topics', 'kafka', 'kafka'),
			menuItem('BigQuery', 'bigquery', 'bigquery'),
			features?.unleash && menuItem('Unleash', 'unleash')
		].filter(Boolean) as { label: string; href: string; active?: boolean }[],
		[
			menuItem('Alerts', 'alerts'),
			menuItem('Issues', 'issues'),
			menuItem('Deployments', 'deploy'),
			menuItem('Cost', 'cost'),
			menuItem('Utilization', 'utilization'),
			menuItem('Vulnerabilities', 'vulnerabilities')
		],
		[
			menuItem('Members', 'members'),
			menuItem('Repositories', 'repositories'),
			(member || isAdmin) && menuItem('Settings', 'settings'),
			menuItem('Activity Log', 'activity-log')
		].filter(Boolean) as { label: string; href: string; active?: boolean }[]
	];
};
