<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';

	interface Props {
		cdnBucket: string;
	}

	let { cdnBucket }: Props = $props();
</script>

<div>
	<Heading size="small" as="h3">Team CDN Bucket</Heading>

	<ExternalLink href="https://console.cloud.google.com/storage/browser/{cdnBucket}">
		{cdnBucket}
	</ExternalLink>
</div>
