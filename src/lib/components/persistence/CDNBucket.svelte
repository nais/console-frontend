<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';

	interface Props {
		cdnBucket: string;
	}

	let { cdnBucket }: Props = $props();
</script>

<div>
	<Heading size="small" level="3">Team CDN Bucket</Heading>

	<a href="https://console.cloud.google.com/storage/browser/{cdnBucket}">
		{cdnBucket}
	</a>
</div>
