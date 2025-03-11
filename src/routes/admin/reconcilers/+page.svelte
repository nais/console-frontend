<script lang="ts">
	import type { PageProps } from './$houdini';
	import Reconciler from './Reconciler.svelte';

	let { data }: PageProps = $props();

	let { AdminReconcilers } = $derived(data);
	let reconcilers = $derived($AdminReconcilers.data?.reconcilers.nodes);
</script>

{#each reconcilers || [] as r (r.id)}
	<Reconciler reconciler={r} />
{:else}
	<p>No reconcilers registered</p>
{/each}
