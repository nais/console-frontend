<script lang="ts">
	import Time from '$lib/ui/Time.svelte';

	interface Props {
		actor: string;
		createdAt: Date;
	}

	let { actor, createdAt }: Props = $props();
</script>

<small class="meta">
	{actor}
	<Time time={createdAt} distance />
</small>

<style>
	.meta {
		font-size: var(--ax-font-size-small);
		line-height: var(--ax-font-line-height-large);
		color: var(--ax-text-neutral-subtle);
		margin: 0;
	}
</style>
