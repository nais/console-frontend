<script module>
	import Menu from '$lib/ui/Menu.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		component: Menu,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
</script>

<Story name="Team menu" asChild>
	<Menu
		items={[
			[{ label: 'Team Overview', href: '/team/devteam' }],
			[
				{ label: 'Applications', href: '/team/devteam/applications' },
				{ label: 'Jobs', href: '/team/devteam/jobs', active: true }
			],
			[
				{ label: 'Secrets', href: '/team/devteam/secrets' },
				{ label: 'Cloud SQL', href: '/team/devteam/cloudsql' },
				{ label: 'Buckets', href: '/team/devteam/buckets' },
				{ label: 'Valkey', href: '/team/devteam/valkey' },
				{ label: 'OpenSearch', href: '/team/devteam/opensearch' },
				{ label: 'Kafka Topics', href: '/team/devteam/kafka' },
				{ label: 'BigQuery', href: '/team/devteam/bigquery' },
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
				{ label: 'Activity Log', href: '/team/devteam/activity-log' }
			]
		]}
	/>
</Story>

<Story name="Application menu" asChild>
	<Menu
		items={[
			[{ label: 'App Overview', href: '/team/devteam/dev/app/app-w-all-storage' }],
			[
				{
					label: 'Vulnerabilities',
					href: '/team/devteam/dev/app/app-w-all-storage/vulnerabilities'
				},
				{ label: 'Deployments', href: '/team/devteam/dev/app/app-w-all-storage/deploys' },
				{ label: 'Cost', href: '/team/devteam/dev/app/app-w-all-storage/cost' },
				{
					label: 'Utilization',
					href: '/team/devteam/dev/app/app-w-all-storage/utilization',
					active: true
				},
				{ label: 'Logs', href: '/team/devteam/dev/app/app-w-all-storage/logs' }
			],
			[{ label: 'Manifest', href: '/team/devteam/dev/app/app-w-all-storage/manifest' }]
		]}
	/>
</Story>

<Story name="Job menu" asChild>
	<Menu
		items={[
			[{ label: 'Job Overview', href: '/team/devteam/dev/app/app-w-all-storage' }],
			[
				{
					label: 'Vulnerabilities',
					href: '/team/devteam/dev/app/app-w-all-storage/vulnerabilities'
				},
				{ label: 'Deployments', href: '/team/devteam/dev/app/app-w-all-storage/deploys' },
				{ label: 'Cost', href: '/team/devteam/dev/app/app-w-all-storage/cost' },
				{ label: 'Logs', href: '/team/devteam/dev/app/app-w-all-storage/logs' }
			],
			[{ label: 'Manifest', href: '/team/devteam/dev/app/app-w-all-storage/manifest' }]
		]}
	/>
</Story>
