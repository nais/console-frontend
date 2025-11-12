<script module>
	import Tab from '$lib/Tab.svelte';
	import Tabs from '$lib/Tabs.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Lib/Tabs',
		component: Tabs,
		tags: ['autodocs']
	});
</script>

<Story name="Basic tabs" asChild>
	<Tabs>
		<Tab href="/overview" title="Overview" active />
		<Tab href="/deployments" title="Deployments" />
		<Tab href="/logs" title="Logs" />
	</Tabs>
</Story>

<Story name="Many tabs" asChild>
	<Tabs>
		<Tab href="/overview" title="Overview" />
		<Tab href="/vulnerability-report" title="Vulnerability Report" active />
		<Tab href="/deployments" title="Deployments" />
		<Tab href="/cost" title="Cost" />
		<Tab href="/utilization" title="Utilization" />
		<Tab href="/logs" title="Logs" />
		<Tab href="/manifest" title="Manifest" />
	</Tabs>
</Story>

<Story name="Two tabs" asChild>
	<Tabs>
		<Tab href="/single" title="Single Instance" active />
		<Tab href="/cascading" title="Cascading Instances" />
	</Tabs>
</Story>
