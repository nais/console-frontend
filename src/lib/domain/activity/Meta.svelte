<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	interface Props {
		actor: string;
		createdAt: Date;
		actorPrefix?: string;
	}

	let { actor, createdAt, actorPrefix = 'By' }: Props = $props();
</script>

<BodyShort textColor="subtle" size="small">
	{actorPrefix}
	{actor}
	<Time time={createdAt} distance />
</BodyShort>
