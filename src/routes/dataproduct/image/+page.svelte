<script lang="ts">
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { AllImages } = $derived(data);
</script>

{#if $AllImages.data}
	{#each $AllImages.data.teams.nodes.flatMap( (team) => team.workloads.nodes.filter( (workload) => workload.status.errors.some((error) => error.__typename === 'WorkloadStatusDeprecatedRegistry') ) ) as workload (workload.id)}
		{workload.team.slug},{workload.environment.name},{workload.name},{workload.status.errors.find(
			(error) => error.__typename === 'WorkloadStatusDeprecatedRegistry'
		)?.registry}<br />
	{/each}
{/if}
