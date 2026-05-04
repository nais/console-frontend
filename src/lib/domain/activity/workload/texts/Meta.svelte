<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	interface Props {
		actor: string;
		createdAt: Date;
	}

	let { actor, createdAt }: Props = $props();
</script>

<BodyShort textColor="subtle" size="small">
	By {actor}
	<Time time={createdAt} distance />
</BodyShort>
