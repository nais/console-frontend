<script lang="ts">
	import type {
		ActivityLogActivityType$options,
		ActivityLogEntryResourceType$options
	} from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import type { TimelineModes } from './shared/texts/types';

	interface Props {
		actor: string;
		createdAt: Date;
		mode?: TimelineModes;
		link?: {
			teamSlug?: string | null;
			environmentName?: string | null;
			resourceType: ActivityLogEntryResourceType$options;
			activityType: ActivityLogActivityType$options;
			id: string;
		};
	}

	let { actor, createdAt, mode = 'full', link }: Props = $props();

	function buildHref() {
		if (!link || !link.teamSlug) return null;

		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const params = new URLSearchParams();
		params.set('activityTypes', link.activityType);
		if (link.environmentName) {
			params.set('environments', link.environmentName);
		}
		params.set('resourceTypes', link.resourceType);
		params.set('id', link.id);

		return `/team/${link.teamSlug}/activity-log?${params.toString()}`;
	}
</script>

<small class="meta">
	{actor}
	{#if mode === 'sidebar' && link && link.teamSlug}
		<a href={buildHref()}>
			<Time time={createdAt} distance />
		</a>
	{:else}
		<Time time={createdAt} distance />
	{/if}
</small>

<style>
	.meta {
		display: block;
		font-size: var(--ax-font-size-small);
		line-height: var(--ax-font-line-height-large);
		color: var(--ax-text-neutral-subtle);
		margin: 0;
	}
</style>
