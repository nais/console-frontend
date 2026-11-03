<script lang="ts">
	import { type IssueFragment } from '$houdini';
	import IssueListItem from '#lib/domain/list-items/IssueListItem.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';

	interface Props {
		title: string;
		viewAllHref: string;
		issues: { node: IssueFragment }[];
	}

	let { title, viewAllHref, issues }: Props = $props();
</script>

<SurfaceCard {title}>
	{#snippet headerAside()}
		<a class="view-all" href={viewAllHref}>View all</a>
	{/snippet}

	<Collection headerless>
		{#each issues as edge, index (index)}
			<IssueListItem item={edge.node} />
		{/each}
	</Collection>
</SurfaceCard>

<style>
	.view-all {
		font-size: var(--sh-font-size-xs);
		font-weight: var(--sh-font-weight-medium);
		color: var(--muted-foreground);
		text-decoration: none;
	}

	.view-all:hover {
		color: var(--foreground);
		text-decoration: underline;
	}
</style>
