<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';

	const { Story } = defineMeta({
		component: GraphErrors,
		title: 'Lib/GraphErrors',
		tags: ['autodocs']
	});
</script>

<script>
	let dismissableErrors = $state([
		{ message: 'Failed to load data' },
		{ message: 'Connection timeout' }
	]);
</script>

<Story name="Single error" asChild>
	<GraphErrors errors={[{ message: 'Failed to load deployment data' }]} />
</Story>

<Story name="Multiple errors" asChild>
	<GraphErrors
		errors={[
			{ message: 'Failed to fetch user data' },
			{ message: 'Network error occurred' },
			{ message: 'Invalid API response' }
		]}
	/>
</Story>

<Story name="Duplicate errors filtered" asChild>
	<div>
		<p style="margin-bottom: 1rem;">
			Duplicate error messages are automatically filtered (4 errors, 2 unique):
		</p>
		<GraphErrors
			errors={[
				{ message: 'Database connection failed' },
				{ message: 'Database connection failed' },
				{ message: 'Timeout error' },
				{ message: 'Database connection failed' }
			]}
		/>
	</div>
</Story>

<Story name="Small size" asChild>
	<GraphErrors
		size="small"
		errors={[{ message: 'Failed to load data' }, { message: 'Please try again later' }]}
	/>
</Story>

<Story name="Dismissable" asChild>
	<div>
		<p style="margin-bottom: 1rem;">Click "Dismiss" to clear the errors:</p>
		<GraphErrors bind:errors={dismissableErrors} dismissable={true} />
		{#if dismissableErrors.length === 0}
			<p style="margin-top: 1rem; color: var(--ax-text-success);">Errors dismissed!</p>
		{/if}
	</div>
</Story>

<Story name="No errors" asChild>
	<div>
		<p>When there are no errors, nothing is rendered:</p>
		<GraphErrors errors={[]} />
		<p>Above this line (nothing should appear)</p>
	</div>
</Story>

<Story name="In context with content" asChild>
	<div style="max-width: 600px;">
		<h2 style="margin-bottom: 1rem;">Deployment Status</h2>
		<GraphErrors
			errors={[
				{ message: 'Failed to fetch latest deployment' },
				{ message: 'API rate limit exceeded' }
			]}
		/>
		<div
			style="border: 1px solid var(--ax-border-neutral); padding: 1rem; border-radius: 8px; background: var(--ax-bg-sunken);"
		>
			<p>Deployment content would appear here...</p>
		</div>
	</div>
</Story>
