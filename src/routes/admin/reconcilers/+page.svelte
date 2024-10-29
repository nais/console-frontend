<script lang="ts">
	import type { PageData } from './$houdini';
	import Reconciler from './Reconciler.svelte';

	export let data: PageData;

	$: ({ AdminReconcilers } = data);
	$: reconcilers = $AdminReconcilers.data?.reconcilers.nodes;
</script>

{#each reconcilers || [] as r}
	<Reconciler reconciler={r} />
{:else}
	<p>No reconcilers registered</p>
{/each}
