<script lang="ts">
	import Time from '$lib/Time.svelte';
	import type { Secret$result } from '$houdini';

	export let lastModifiedAt: Secret$result['team']['secret']['lastModifiedAt'];
	export let lastModifiedBy: Secret$result['team']['secret']['lastModifiedBy'];
</script>

<h4>Metadata</h4>
<h5>Last modified</h5>
<div class="value">
	{#if lastModifiedAt}
		<Time time={lastModifiedAt} distance />
	{:else}
		<code>n/a</code>
	{/if}
</div>
<h5>Last modified by</h5>
<div class="value">
	{#if lastModifiedBy}
		<span class="cap" title={lastModifiedBy.email}>{lastModifiedBy.name}</span>
	{:else}
		<code>n/a</code>
	{/if}
</div>

<style>
	h4 {
		display: flex;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	h5 {
		margin-top: 1rem;
		gap: 0.5rem;
	}

	code {
		font-size: 1rem;
	}

	.value {
		margin-left: 1rem;
	}

	.cap {
		text-transform: capitalize;
	}
</style>
