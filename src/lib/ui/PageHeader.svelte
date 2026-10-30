<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { RouteId } from '$app/types';
	import { ShBadge } from '#lib/shadcn/ui/index.js';
	import AddToFavorites from '#lib/ui/AddToFavorites.svelte';
	import DocsLink from '#lib/ui/DocsLink.svelte';
	import { getHeaderActionsContext } from '#lib/ui/headerActionsContext.svelte.js';
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
	const srOnlyHeading = $derived(!heading ? (page.data?.meta?.title ?? '') : '');
	const tag = $derived(page.data?.meta?.tag ?? null);
	const docPath = $derived(page.data?.meta?.docPath ?? null);
	const isVisuallyEmpty = $derived(!heading && breadcrumbs.length === 0 && !beforeBreadcrumbs);
	const resolveUnsafe = resolve as unknown as (
		href: string,
		params?: Record<string, string>
	) => string;

	function resolveRouteHref(href: RouteId) {
		return resolveUnsafe(href, page.params);
	}

	function mapTagVariant(
		variant?: string
	): 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'info' {
		if (!variant) return 'secondary';
		if (variant.includes('success')) return 'success';
		if (variant.includes('warning')) return 'warning';
		if (variant.includes('error') || variant.includes('danger')) return 'destructive';
		if (variant.includes('info') || variant.includes('alt')) return 'info';
		return 'secondary';
	}
</script>

<div class="page-header" class:visually-empty={isVisuallyEmpty}>
	{#if breadcrumbs.length}
		<div class="breadcrumbs-wrapper">
			<div class="breadcrumbs-left">
				{#if beforeBreadcrumbs}
					<div class="breadcrumbs-trigger">{@render beforeBreadcrumbs()}</div>
				{/if}
				<nav class="breadcrumbs" aria-label="Breadcrumb">
					{#each breadcrumbs as breadcrumb, i (`${breadcrumb.label}-${i}`)}
						{#if i > 0}
							<span class="divider" aria-hidden="true">/</span>
						{/if}
						{#if breadcrumb.href}
							<a href={resolveRouteHref(breadcrumb.href)} class="link">{breadcrumb.label}</a>
						{:else}
							<span class="current">{breadcrumb.label}</span>
						{/if}
					{/each}
				</nav>
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
				<h1 class="page-title">{heading}</h1>
				{#if tag}
					<ShBadge variant={mapTagVariant(tag.variant)} size="sm">{tag.label}</ShBadge>
				{/if}
			</div>
			<div class="actions">
				{#if headerActions?.snippet}
					{@render headerActions.snippet()}
				{/if}
				{#if breadcrumbs.length === 0}
					<AddToFavorites path={page.url.pathname} />
					{#if docPath}
						<DocsLink path={docPath} />
					{/if}
				{/if}
			</div>
		</div>
	{:else if srOnlyHeading}
		<h1 class="sr-only">{srOnlyHeading}</h1>
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);

		&.visually-empty {
			padding-bottom: 0;
			border-bottom: none;
		}

		.header-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 0.75rem;
		}

		.actions {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			flex-shrink: 0;
		}

		.breadcrumbs-wrapper {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 0.5rem;

			.breadcrumbs-left {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				min-width: 0;
			}

			.breadcrumbs {
				display: flex;
				gap: 0.375rem;
				align-items: center;
				min-width: 0;
				font-size: 0.8125rem;
				color: var(--muted-foreground);

				.link {
					color: var(--muted-foreground);
					text-decoration: none;
					font-weight: 500;
					transition: color 120ms ease;

					&:hover {
						color: var(--foreground);
					}
				}

				.current {
					color: var(--foreground);
					font-weight: 500;
				}

				.divider {
					color: var(--muted-foreground);
					opacity: 0.55;
					font-size: 0.75rem;
				}
			}
		}
		.heading-wrapper {
			display: flex;
			gap: 0.625rem;
			align-items: center;
			flex-wrap: wrap;
		}

		.page-title {
			margin: 0;
			font-size: 1.5rem;
			font-weight: 600;
			letter-spacing: -0.025em;
			line-height: 1.25;
			color: var(--foreground);
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
				margin-bottom: 0.25rem;
			}

			.header-row {
				align-items: flex-start;
			}
		}
	}
</style>
