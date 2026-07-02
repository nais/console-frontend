<script lang="ts">
	import { type IssueFragment } from '$houdini';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';

	interface Props {
		title: string;
		viewAllHref: string;
		issues: { node: IssueFragment }[];
	}

	let { title, viewAllHref, issues }: Props = $props();
</script>

<SurfaceCard {title} bordered>
	{#snippet headerAside()}
		<a class="view-all" href={viewAllHref}>View all</a>
	{/snippet}

	<List>
		{#each issues as edge, index (index)}
			<IssueListItem item={edge.node} />
		{/each}
	</List>
</SurfaceCard>

<style>
	.view-all {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-accent);
		text-decoration: none;
	}

	.view-all:hover {
		text-decoration: underline;
	}
</style>
