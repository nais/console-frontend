<script>
	import { page } from '$app/state';
	import { BodyShort, Heading } from '@nais/ds-svelte-community';
	import { docURL } from '$lib/doc.js';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
</script>

<div>
	<Heading size="large">{page.status}</Heading>
	<BodyShort>
		{page.error?.message || 'Unknown error'}
	</BodyShort>
	{#if page.error?.docPath}
		<BodyShort>
			For more information, see the
			<ExternalLink href={docURL(page.error.docPath)}>Nais documentation</ExternalLink>.
		</BodyShort>
	{/if}
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 20vh;
	}
</style>
