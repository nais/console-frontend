<script lang="ts">
	import { Heading, Link } from '@nais/ds-svelte-community';

	const {
		breadcrumbs,
		heading,
		subheading
	}: { breadcrumbs: { label: string; href: string }[]; heading: string; subheading?: string } =
		$props();
</script>

<div class="page-header">
	<div class="breadcrumbs">
		{#each breadcrumbs as { label, href } (href)}
			<Link {href} class="link">{label}</Link>
			<span class="divider">/</span>
		{/each}
	</div>
	<div class="heading">
		<Heading level="1" size="xlarge">{heading}</Heading>
		{#if subheading}
			<div class="subheading">{subheading}</div>
		{/if}
	</div>
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

		.heading {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--a-spacing-1);

			.subheading {
				color: var(--a-text-subtle);
			}
		}
	}
</style>
