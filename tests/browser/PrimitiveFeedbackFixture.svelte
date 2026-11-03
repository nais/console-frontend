<script lang="ts">
	import Loader from '../../src/lib/shadcn/ui/Loader.svelte';
	import Heading from '../../src/lib/shadcn/ui/Heading.svelte';
	import AddToFavorites from '../../src/lib/ui/AddToFavorites.svelte';

	const sizes = ['3xlarge', '2xlarge', 'xlarge', 'large', 'medium', 'small', 'xsmall'] as const;
	const headingSizes = ['xlarge', 'large', 'medium', 'small', 'xsmall'] as const;
</script>

<main>
	<AddToFavorites path="/team/feedback-fixture" />
	{#each sizes as size (size)}
		<Loader {size} title={`Loading ${size}`} />
	{/each}
	<Loader title="Styled loading" size="large" style="color: var(--ax-text-accent)" />
	{#each headingSizes as size (size)}
		<Heading as="h2" {size} spacing>{size} heading</Heading>
	{/each}
</main>
