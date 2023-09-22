<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type JobStatus } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import UnknownIcon from '$lib/icons/UnknownIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';

	$: teamName = $page.params.team;
	$: envName = $page.params.env;
	$: jobName = $page.params.job;

	export let job: JobStatus;
	$: data = fragment(
		job,
		graphql(`
			fragment JobStatus on NaisJob {
				jobState @loading {
					state @loading
				}
			}
		`)
	);
</script>

<div class="wrapper">
	<h4>Status</h4>
	<a class="status" href="/team/{teamName}/{envName}/job/{jobName}/status">
		{#if $data.jobState.state == PendingValue}
			<Loading />
		{:else if $data.jobState.state === 'NAIS'}
			<Nais
				size="5rem"
				style="color: var(--a-icon-success)"
				aria-label="Application is nais"
				role="image"
			/>
		{:else if $data.jobState.state === 'FAILING'}
			<WarningIcon
				size="5rem"
				style="color: var(--a-icon-danger)"
				aria-label="Application is failing"
				role="image"
			/>
		{:else if $data.jobState.state === 'NOTNAIS'}
			<Nais
				size="5rem"
				style="color: var(--a-icon-warning)"
				aria-label="Application is not nais"
				role="image"
			/>
		{:else if $data.jobState.state === 'UNKNOWN'}
			<UnknownIcon
				size="5rem"
				style="color: var(--a-icon-warning)"
				aria-label="Unknown application status"
				role="image"
			/>
		{/if}
	</a>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
	}
	a.status {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
	}
</style>
