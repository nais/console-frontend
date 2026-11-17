<script lang="ts">
	import { BodyShort, Loader } from '#lib/shadcn/ui/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import type { PageProps } from './$types';
	import PostgresCosts from './PostgresCosts.svelte';

	let { data }: PageProps = $props();
	let { PostgresCosts: costs } = $derived(data);
</script>

<GraphErrors errors={$costs.errors} />

{#if $costs.data?.team.environment.postgres}
	<PostgresCosts
		cost={$costs.data.team.environment.postgres.cost}
		interval={data.interval}
		from={data.from}
		to={data.to}
	/>
{:else if $costs.fetching}
	<div class="loading-centered" role="status" aria-label="Loading Postgres costs">
		<Loader size="3xlarge" />
	</div>
{:else if !$costs.errors?.length}
	<BodyShort>Postgres cost data is unavailable.</BodyShort>
{/if}
