<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	export let log: {
		message: string;
		createdAt: Date;
		actor: string | null;
		action: string;
	};
</script>

<div class="log-line">
	<p>
		{log.message}
	</p>
	<BodyShort size="small" style="color: var(--a-text-subtle)">
		<Time time={log.createdAt} dateFormat="dd. MMM yyyy HH:mm:ss" /> -
		{log.actor || log.action}
	</BodyShort>
</div>

<style>
	.log-line p {
		margin: 0;
	}

	.log-line:is(:not(:last-child)) {
		border-bottom: 1px solid var(--a-border-divider);
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}
</style>
