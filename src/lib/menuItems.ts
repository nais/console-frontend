export const menuItems = ({
	path,
	features
}: {
	path: string;
	features?: {
		unleash: { enabled: boolean };
		valkey: { enabled: boolean };
		kafka: { enabled: boolean };
		openSearch: { enabled: boolean };
	};
}): { label: string; href: string; active?: boolean }[][] => {
	const split = path.split('/');

	const item =
		(baseUrl: string, page: string) =>
		(label: string, pageName?: string, matchSubPath?: string) => {
			const href = pageName ? `${baseUrl}/${pageName}` : baseUrl;
			const active =
				(matchSubPath && path.startsWith(`/team/${team}/${page}/${matchSubPath}/`)) ||
				pageName === page;

			return {
				label,
				href,
				...(active ? { active } : {})
			};
		};
	const [, , team, topLevelPage, resourceType] = split;
	const page =
		topLevelPage && ['app', 'job'].includes(resourceType)
			? resourceType === 'app'
				? 'applications'
				: 'jobs'
			: topLevelPage;
	const menuItem = item(`/team/${team}`, page);
	return [
		[menuItem('Team Overview')],
		[menuItem('Applications', 'applications'), menuItem('Jobs', 'jobs')],
		[
			menuItem('Secrets', 'secrets', 'secret'),
			menuItem('Configs', 'configs', 'config'),
			menuItem('Cloud SQL', 'cloudsql', 'cloudsql'),
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
			menuItem('Settings', 'settings'),
			menuItem('Activity Log', 'activity-log')
		].filter(Boolean) as { label: string; href: string; active?: boolean }[]
	];
};
