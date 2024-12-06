<script lang="ts">
	import type { PageData } from './$houdini';
	import Reconciler from './Reconciler.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { AdminReconcilers } = $derived(data);
	let reconcilers = $derived($AdminReconcilers.data?.reconcilers.nodes);
</script>

{#each reconcilers || [] as r}
	<Reconciler reconciler={r} />
{:else}
	<p>No reconcilers registered</p>
{/each}
