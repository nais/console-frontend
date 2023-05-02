<script lang="ts">
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import { fragment, graphql } from '$houdini';
	import type { Instances } from '$houdini';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';

	export let app: Instances;
	$: data = fragment(
		app,
		graphql(`
			fragment Instances on App {
				instances {
					name
					status
				}
			}
		`)
	);

	$: instances = $data.instances;
</script>

<div style="display: flex; align-items: center; flex-direction: row; gap: 1rem;">
	{#if instances}
		{#if instances.filter((instance) => instance.status === 'Running').length === instances.length}
			<SuccessIcon size="1.5rem" style="color: var(--a-icon-success)" />
		{:else}
			<WarningIcon size="1.5rem" style="color: var(--a-icon-warning)" />
		{/if}
	{:else}
		<!-- unknown -->
	{/if}
</div>
