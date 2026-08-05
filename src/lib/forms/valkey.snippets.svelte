<script lang="ts" module>
	export { maxMemoryPolicyDescription, notifyKeyspaceEventsDescription };
</script>

<script lang="ts">
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
</script>

{#snippet maxMemoryPolicyDescription()}
	Automatically evict old data as you add new data, see the
	<ExternalLink href="https://valkey.io/topics/lru-cache/">Valkey documentation</ExternalLink>
	for details.
{/snippet}

{#snippet notifyKeyspaceEventsDescription()}
	See the
	<ExternalLink href="https://valkey.io/topics/notifications">Valkey documentation</ExternalLink>
	for details.
{/snippet}
