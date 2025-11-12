<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DeploymentStatus from './DeploymentStatus.svelte';

	const { Story } = defineMeta({
		component: DeploymentStatus,
		title: 'Lib/DeploymentStatus',
		tags: ['autodocs']
	});
</script>

<Story name="Success" asChild>
	<DeploymentStatus status="SUCCESS" />
</Story>

<Story name="In Progress" asChild>
	<DeploymentStatus status="IN_PROGRESS" />
</Story>

<Story name="Queued" asChild>
	<DeploymentStatus status="QUEUED" />
</Story>

<Story name="Failed" asChild>
	<DeploymentStatus status="FAILURE" />
</Story>

<Story name="Error" asChild>
	<DeploymentStatus status="ERROR" />
</Story>

<Story name="Inactive" asChild>
	<DeploymentStatus status="INACTIVE" />
</Story>

<Story name="Pending" asChild>
	<DeploymentStatus status="PENDING" />
</Story>

<Story name="Unknown" asChild>
	<DeploymentStatus status="UNKNOWN" />
</Story>

<Story name="All states" asChild>
	<div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
		<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
			<DeploymentStatus status="SUCCESS" />
			<span style="font-size: 0.875rem; color: var(--ax-text-subtle);">Success</span>
		</div>
		<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
			<DeploymentStatus status="IN_PROGRESS" />
			<span style="font-size: 0.875rem; color: var(--ax-text-subtle);">In Progress</span>
		</div>
		<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
			<DeploymentStatus status="QUEUED" />
			<span style="font-size: 0.875rem; color: var(--ax-text-subtle);">Queued</span>
		</div>
		<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
			<DeploymentStatus status="FAILURE" />
			<span style="font-size: 0.875rem; color: var(--ax-text-subtle);">Failed</span>
		</div>
		<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
			<DeploymentStatus status="ERROR" />
			<span style="font-size: 0.875rem; color: var(--ax-text-subtle);">Error</span>
		</div>
		<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
			<DeploymentStatus status="INACTIVE" />
			<span style="font-size: 0.875rem; color: var(--ax-text-subtle);">Inactive</span>
		</div>
		<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
			<DeploymentStatus status="PENDING" />
			<span style="font-size: 0.875rem; color: var(--ax-text-subtle);">Pending</span>
		</div>
		<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
			<DeploymentStatus status="UNKNOWN" />
			<span style="font-size: 0.875rem; color: var(--ax-text-subtle);">Unknown</span>
		</div>
	</div>
</Story>

<Story name="In deployment list" asChild>
	<div style="max-width: 600px;">
		<div
			style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; padding: 1rem; border: 1px solid var(--ax-border-subtle);"
		>
			<div>
				<strong>roger deployed myapp to production</strong>
				<div style="font-size: 0.875rem; color: var(--ax-text-subtle);">2 hours ago</div>
			</div>
			<DeploymentStatus status="SUCCESS" />
		</div>
		<div
			style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; padding: 1rem; border: 1px solid var(--ax-border-subtle); border-top: none;"
		>
			<div>
				<strong>alice deployed backend to dev</strong>
				<div style="font-size: 0.875rem; color: var(--ax-text-subtle);">5 minutes ago</div>
			</div>
			<DeploymentStatus status="IN_PROGRESS" />
		</div>
		<div
			style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; padding: 1rem; border: 1px solid var(--ax-border-subtle); border-top: none;"
		>
			<div>
				<strong>bob deployed frontend to staging</strong>
				<div style="font-size: 0.875rem; color: var(--ax-text-subtle);">1 day ago</div>
			</div>
			<DeploymentStatus status="FAILURE" />
		</div>
	</div>
</Story>
