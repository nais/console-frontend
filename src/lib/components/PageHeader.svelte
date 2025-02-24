<script lang="ts">
	import { Heading, Link } from '@nais/ds-svelte-community';

	const {
		breadcrumbs = [],
		heading
	}: {
		breadcrumbs?: { label: string; href?: string }[];
		heading: string;
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
	<Heading level="1" size="xlarge">{heading}</Heading>
</div>

<style>
	.page-header {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-1);

		.breadcrumbs {
			display: flex;
			gap: var(--a-spacing-2);

			:global(.link) {
				text-decoration: none;

				&:hover {
					text-decoration: underline;
				}
			}

			.divider {
				color: var(--a-text-subtle);
			}
		}
	}
</style>
