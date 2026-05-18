<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { RouteId } from '$app/types';
	import AddToFavorites from '$lib/ui/AddToFavorites.svelte';
	import DocsLink from '$lib/ui/DocsLink.svelte';
	import { getHeaderActionsContext } from '$lib/ui/headerActionsContext.svelte';
	import { Heading, Tag } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	const { beforeBreadcrumbs }: { beforeBreadcrumbs?: Snippet } = $props();

	const headerActions = getHeaderActionsContext();

	const breadcrumbs = $derived.by(() => {
		const baseBreadcrumbs = page.data?.meta?.breadcrumbs ?? [];
		const title = page.data?.meta?.title;

		if (baseBreadcrumbs.length === 0 || !title) {
			return baseBreadcrumbs;
		}

		if (baseBreadcrumbs.at(-1)?.label === title) {
			return baseBreadcrumbs;
		}

		return [...baseBreadcrumbs, { label: title }];
	});
	const heading = $derived(page.data?.meta?.pageHeaderTitle ?? page.data?.meta?.title ?? '');
	const tag = $derived(page.data?.meta?.tag ?? null);
	const docPath = $derived(page.data?.meta?.docPath ?? null);
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
			<div class="breadcrumbs-left">
				{#if beforeBreadcrumbs}
					<div class="breadcrumbs-trigger">{@render beforeBreadcrumbs()}</div>
				{/if}
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
			</div>
			<div class="actions">
				<AddToFavorites path={page.url.pathname} />
				{#if docPath}
					<DocsLink path={docPath} />
				{/if}
			</div>
		</div>
	{/if}
	{#if !breadcrumbs.length && beforeBreadcrumbs}
		<div class="breadcrumbs-trigger breadcrumbs-trigger-row">{@render beforeBreadcrumbs()}</div>
	{/if}
	{#if heading}
		<div class="header-row">
			<div class="heading-wrapper">
				<Heading as="h1" size="xlarge">{heading}</Heading>
				{#if tag}
					<Tag variant={tag.variant}>{tag.label}</Tag>
				{/if}
			</div>
			<div class="actions">
				{#if headerActions?.snippet}
					{@render headerActions.snippet()}
				{/if}
				{#if breadcrumbs.length === 0}
					<AddToFavorites path={page.url.pathname} />
				{/if}
				{#if docPath}
					<DocsLink path={docPath} />
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);

		.header-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--ax-space-8);
		}

		.actions {
			display: flex;
			align-items: center;
			gap: var(--ax-space-4);
			flex-shrink: 0;
		}

		.breadcrumbs-wrapper {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: var(--ax-space-8);
			margin-bottom: var(--ax-space-4);

			.breadcrumbs-left {
				display: flex;
				align-items: center;
				gap: var(--ax-space-8);
				min-width: 0;
			}

			.breadcrumbs {
				display: flex;
				gap: var(--ax-space-8);
				align-items: center;
				min-width: 0;

				.link {
					text-decoration: none;

					&:hover {
						text-decoration: underline;
					}
				}

				.divider {
					color: var(--ax-text-neutral-subtle);
				}
			}
		}
		.heading-wrapper {
			display: flex;
			gap: var(--ax-space-12);
			align-items: center;
			flex-wrap: wrap;
		}

		.breadcrumbs-trigger-row {
			display: none;
		}
	}

	@media (max-width: 767px), (max-height: 500px) {
		.page-header {
			.breadcrumbs-wrapper {
				align-items: center;
				flex-wrap: wrap;
			}

			.breadcrumbs-wrapper .breadcrumbs-left {
				width: 100%;
				align-items: center;
			}

			.breadcrumbs-wrapper .breadcrumbs {
				flex-wrap: wrap;
			}

			.breadcrumbs-trigger-row {
				display: flex;
				margin-bottom: var(--ax-space-4);
			}

			.header-row {
				align-items: flex-start;
			}
		}
	}
</style>
