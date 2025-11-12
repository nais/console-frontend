<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ServiceMaintenanceStatus from '$lib/ui/ServiceMaintenanceStatus.svelte';

	const { Story } = defineMeta({
		component: ServiceMaintenanceStatus,
		title: 'Lib/ServiceMaintenanceStatus',
		tags: ['autodocs']
	});
</script>

<Story name="Has deadline" asChild>
	<ServiceMaintenanceStatus status={true} />
</Story>

<Story name="No deadline" asChild>
	<ServiceMaintenanceStatus status={false} />
</Story>

<Story name="Both states" asChild>
	<div style="display: flex; gap: 1rem; align-items: center;">
		<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
			<ServiceMaintenanceStatus status={true} />
			<span style="font-size: 0.875rem; color: var(--ax-text-subtle);">Has deadline</span>
		</div>
		<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
			<ServiceMaintenanceStatus status={false} />
			<span style="font-size: 0.875rem; color: var(--ax-text-subtle);">No deadline</span>
		</div>
	</div>
</Story>

<Story name="In service list" asChild>
	<div style="max-width: 600px;">
		<div
			style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; padding: 1rem; border: 1px solid var(--ax-border-subtle); align-items: center;"
		>
			<div>
				<strong>PostgreSQL Database</strong>
				<div style="font-size: 0.875rem; color: var(--ax-text-subtle);">
					Scheduled maintenance window
				</div>
			</div>
			<ServiceMaintenanceStatus status={true} />
		</div>
		<div
			style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; padding: 1rem; border: 1px solid var(--ax-border-subtle); border-top: none; align-items: center;"
		>
			<div>
				<strong>Redis Cache</strong>
				<div style="font-size: 0.875rem; color: var(--ax-text-subtle);">Running normally</div>
			</div>
			<ServiceMaintenanceStatus status={false} />
		</div>
		<div
			style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; padding: 1rem; border: 1px solid var(--ax-border-subtle); border-top: none; align-items: center;"
		>
			<div>
				<strong>OpenSearch Cluster</strong>
				<div style="font-size: 0.875rem; color: var(--ax-text-subtle);">
					Upgrade required by March 2025
				</div>
			</div>
			<ServiceMaintenanceStatus status={true} />
		</div>
	</div>
</Story>
