<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { RouteId } from '$app/types';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import AddToFavorites from '$lib/ui/AddToFavorites.svelte';
	import { getPageHeaderWarning } from '$lib/ui/pageHeaderState.svelte';
	import { Heading, Tag } from '@nais/ds-svelte-community';

	const breadcrumbs = $derived(page.data?.meta?.breadcrumbs ?? []);
	const heading = $derived(page.data?.meta?.title ?? '');
	const tag = $derived(page.data?.meta?.tag ?? null);
	const warning = $derived(getPageHeaderWarning());
	const resolveUnsafe = resolve as unknown as (
		href: string,
		params?: Record<string, string>
	) => string;

	function resolveRouteHref(href: RouteId) {
		return resolveUnsafe(href, page.params);
	}
</script>

<div class="page-header">
	{#if breadcrumbs.length}
		<div class="breadcrumbs-wrapper">
			<div class="breadcrumbs">
				{#each breadcrumbs as breadcrumb (breadcrumb)}
					{#if breadcrumb.href}
						<a href={resolveRouteHref(breadcrumb.href)} class="link">{breadcrumb.label}</a>
					{:else}
						{breadcrumb.label}
					{/if}
					<span class="divider">/</span>
				{/each}
			</div>
			<AddToFavorites path={page.url.pathname} />
		</div>
	{/if}
	<div style="display: flex; align-items: center; justify-content: space-between;">
		<div class="heading-wrapper">
			{#if warning}
				<WarningIcon style="font-size: 1.5rem" />
			{/if}
			<Heading as="h1" size="xlarge">{heading}</Heading>
			{#if tag}
				<Tag variant={tag.variant}>{tag.label}</Tag>
			{/if}
		</div>
		{#if breadcrumbs.length === 0}
			<AddToFavorites path={page.url.pathname} />
		{/if}
	</div>
</div>

<style>
	.page-header {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);

		.breadcrumbs-wrapper {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: var(--ax-space-8);
			margin-bottom: var(--ax-space-4);

			.breadcrumbs {
				display: flex;
				gap: var(--ax-space-8);
				align-items: center;

				.link {
					text-decoration: none;

					&:hover {
						text-decoration: underline;
					}
				}

				.divider {
					color: var(--ax-text-subtle);
				}
			}
		}
		.heading-wrapper {
			display: flex;
			gap: var(--ax-space-12);
			align-items: center;
		}
	}
</style>
