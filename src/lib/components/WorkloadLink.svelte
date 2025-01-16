<script lang="ts">
	import { ArrowCirclepathIcon, SandboxIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		workload: {
			readonly name: string;
			readonly __typename: string | null;
			readonly environment: {
				readonly name: string;
			};
			readonly team: {
				readonly slug: string;
			};
		};
		showIcon?: boolean;
	}

	let { workload, showIcon }: Props = $props();
</script>

<a
	href="/team/{workload.team.slug}/{workload.environment.name}/{workload.__typename === 'Job'
		? 'job'
		: 'app'}/{workload.name}"
>
	{#if showIcon}
		{#if workload.__typename === 'Job'}
			<ArrowCirclepathIcon />
		{:else}
			<SandboxIcon />
		{/if}
	{/if}
	{workload.name}
</a>
