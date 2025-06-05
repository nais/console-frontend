<script lang="ts">
	import { Heading, Link, Tag } from '@nais/ds-svelte-community';
	import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';

	const {
		breadcrumbs = [],
		heading,
		tag
	}: {
		breadcrumbs?: { label: string; href?: string }[];
		heading: string;
		tag?: { label: string; variant: TagProps['variant'] };
	} = $props();
</script>

<div class="page-header">
	{#if breadcrumbs.length}
		<div class="breadcrumbs">
			{#each breadcrumbs as breadcrumb (breadcrumb)}
				{#if breadcrumb.href}
					<Link href={breadcrumb.href} class="link">{breadcrumb.label}</Link>
				{:else}
					{breadcrumb.label}
				{/if}
				<span class="divider">/</span>
			{/each}
		</div>
	{/if}
	<div class="heading-wrapper">
		<Heading level="1" size="xlarge">{heading}</Heading>
		{#if tag}
			<Tag variant={tag.variant}>{tag.label}</Tag>
		{/if}
	</div>
</div>

<style>
	.page-header {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);

		.breadcrumbs {
			display: flex;
			gap: var(--ax-space-8);
			align-items: center;

			:global(.link) {
				text-decoration: none;

				&:hover {
					text-decoration: underline;
				}
			}

			.divider {
				color: var(--ax-text-subtle);
			}
		}

		.heading-wrapper {
			display: flex;
			gap: var(--ax-space-12);
			align-items: center;
		}
	}
</style>
