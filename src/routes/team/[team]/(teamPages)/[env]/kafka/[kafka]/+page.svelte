<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ KafkaTopic } = data);
	$: topic = $KafkaTopic.data?.kafkaTopic;
	$: teamName = $page.params.team;
	$: envName = $page.params.env;

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $KafkaTopic.errors}
	{#each distinctErrors($KafkaTopic.errors) as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if topic && topic.id !== PendingValue}
	<div style="display: grid; gap: 1rem; grid-template-columns: repeat(12, 1fr);">KAFKA</div>
{/if}
