<script lang="ts">
	import Time from '#lib/ui/Time.svelte';
	import type {
		ActivityLogActivityType$options,
		ActivityLogEntryResourceType$options
	} from '$houdini';
	import { getOptionalActivityMetaContext } from './activityMetaContext';
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
	const activityMetaContext = getOptionalActivityMetaContext();
	let teamSlug = $derived(
		activityMetaContext?.showTeam() && activityMetaContext.resourceType() !== 'TEAM'
			? activityMetaContext.teamSlug()
			: undefined
	);

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
	{#if teamSlug}
		<span>in team <a href="/team/{teamSlug}">{teamSlug}</a></span>
	{/if}
</small>

<style>
	.meta {
		display: block;
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--muted-foreground);
		margin: 0.125rem 0 0;
	}

	.meta a {
		color: var(--muted-foreground);
		text-decoration: underline;
		text-decoration-color: var(--border-strong);
		text-underline-offset: 0.18em;
		transition:
			color 120ms ease,
			text-decoration-color 120ms ease;
	}

	.meta a:hover {
		color: var(--foreground);
		text-decoration-color: currentColor;
	}
</style>
