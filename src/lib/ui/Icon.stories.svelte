<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Icon from '$lib/ui/Icon.svelte';

	const { Story } = defineMeta({
		component: Icon,
		tags: ['autodocs']
	});
</script>

<Story name="Applications" asChild>
	<Icon icon="applications" />
</Story>

<Story name="Jobs" asChild>
	<Icon icon="jobs" />
</Story>

<Story name="Secrets" asChild>
	<Icon icon="secrets" />
</Story>

<Story name="Postgres" asChild>
	<Icon icon="postgres" />
</Story>

<Story name="Buckets" asChild>
	<Icon icon="buckets" />
</Story>

<Story name="Valkey" asChild>
	<Icon icon="valkey" />
</Story>

<Story name="OpenSearch" asChild>
	<Icon icon="opensearch" />
</Story>

<Story name="Kafka" asChild>
	<Icon icon="kafka" />
</Story>

<Story name="BigQuery" asChild>
	<Icon icon="bigquery" />
</Story>

<Story name="Unleash" asChild>
	<Icon icon="unleash" />
</Story>

<Story name="Deployments" asChild>
	<Icon icon="deployments" />
</Story>

<Story name="Cost" asChild>
	<Icon icon="cost" />
</Story>

<Story name="Utilization" asChild>
	<Icon icon="utilization" />
</Story>

<Story name="Vulnerabilities" asChild>
	<Icon icon="vulnerabilities" />
</Story>

<Story name="All icons" asChild>
	<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; padding: 1rem;">
		{#each ['Team Overview', 'Applications', 'Jobs', 'Secrets', 'Postgres', 'Buckets', 'Valkey', 'OpenSearch', 'Kafka', 'BigQuery', 'Unleash', 'Deployments', 'Cost', 'Utilization', 'Vulnerabilities', 'Members', 'Repositories', 'Settings', 'Activity Log', 'Status', 'Image', 'Logs', 'Manifest', 'Delete', 'Ingresses', 'Alerts', 'Issues'] as iconName (iconName)}
			<div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
				<Icon icon={iconName} />
				<span style="font-size: 0.75rem; text-align: center;">{iconName}</span>
			</div>
		{/each}
	</div>
</Story>
