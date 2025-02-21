<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Menu from './Menu.svelte';

	const { Story } = defineMeta({
		component: Menu,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
</script>

<Story name="Team menu">
	<Menu
		items={[
			[{ label: 'Overview', href: '/team/devteam' }],
			[
				{ label: 'Applications', href: '/team/devteam/applications', count: 42, badge: true },
				{ label: 'Jobs', href: '/team/devteam/jobs', count: 1, badge: true, active: true }
			],
			[
				{ label: 'Secrets', href: '/team/devteam/secrets' },
				{ label: 'Postgres', href: '/team/devteam/postgres', count: 7 },
				{ label: 'Buckets', href: '/team/devteam/buckets', count: 1337 },
				{ label: 'Redis', href: '/team/devteam/redis', count: 5 },
				{ label: 'Valkey', href: '/team/devteam/valkey', count: 11 },
				{ label: 'OpenSearch', href: '/team/devteam/opensearch', count: 17 },
				{ label: 'Kafka topics', href: '/team/devteam/kafka', count: 23 },
				{ label: 'BigQuery', href: '/team/devteam/bigquery', count: 49 },
				{ label: 'Unleash', href: '/team/devteam/unleash' }
			],
			[
				{ label: 'Deployments', href: '/team/devteam/deploy' },
				{ label: 'Cost', href: '/team/devteam/cost' },
				{ label: 'Utilization', href: '/team/devteam/utilization' },
				{ label: 'Vulnerabilities', href: '/team/devteam/vulnerabilities' }
			],
			[
				{ label: 'Members', href: '/team/devteam/members' },
				{ label: 'Repositories', href: '/team/devteam/repositories' },
				{ label: 'Settings', href: '/team/devteam/settings' },
				{ label: 'Activity log', href: '/team/devteam/activity-log' }
			]
		]}
	/>
</Story>

<Story name="Application menu">
	<Menu
		items={[
			[
				{ label: 'Overview', href: '/team/devteam/dev/app/app-w-all-storage' },
				{ label: 'Status', href: '/team/devteam/dev/app/app-w-all-storage/status' }
			],
			[
				{ label: 'Image', href: '/team/devteam/dev/app/app-w-all-storage/image' },
				{ label: 'Deployments', href: '/team/devteam/dev/app/app-w-all-storage/deploys' },
				{ label: 'Cost', href: '/team/devteam/dev/app/app-w-all-storage/cost' },
				{
					label: 'Utilization',
					href: '/team/devteam/dev/app/app-w-all-storage/utilization',
					active: true
				},
				{ label: 'Logs', href: '/team/devteam/dev/app/app-w-all-storage/logs' }
			],
			[{ label: 'Manifest', href: '/team/devteam/dev/app/app-w-all-storage/manifest' }],
			[{ label: 'Delete', href: '/team/devteam/dev/app/app-w-all-storage/delete' }]
		]}
	/>
</Story>
