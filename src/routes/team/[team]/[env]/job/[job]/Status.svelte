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

	{#if $data.jobState.state == PendingValue}
		<Loading />
	{:else if $data.jobState.state === 'NAIS'}
		<a class="status" href="/team/{teamName}/{envName}/job/{jobName}/status">
			<Nais
				size="5rem"
				style="color: var(--a-icon-success)"
				aria-label="Application is nais"
				role="image"
			/>
		</a>
		<a
			class="status padding-top"
			style="padding-top: 1rem"
			href="/team/{teamName}/{envName}/job/{jobName}/status">All nais</a
		>
	{:else if $data.jobState.state === 'FAILING'}
		<a class="status" href="/team/{teamName}/{envName}/job/{jobName}/status">
			<WarningIcon
				size="5rem"
				style="color: var(--a-icon-danger)"
				aria-label="Application is failing"
				role="image"
			/>
		</a>
		<a class="status padding-top" href="/team/{teamName}/{envName}/job/{jobName}/status"
			>App is failing</a
		>
	{:else if $data.jobState.state === 'NOTNAIS'}
		<a class="status" href="/team/{teamName}/{envName}/job/{jobName}/status">
			<Nais
				size="5rem"
				style="color: var(--a-icon-warning)"
				aria-label="Application is not nais"
				role="image"
			/></a
		>
		<a class="status padding-top" href="/team/{teamName}/{envName}/job/{jobName}/status"
			>App is not nais</a
		>
	{:else if $data.jobState.state === 'UNKNOWN'}
		<a class="status" href="/team/{teamName}/{envName}/job/{jobName}/status">
			<UnknownIcon
				size="5rem"
				style="color: var(--a-icon-warning)"
				aria-label="Unknown application status"
				role="image"
			/>
		</a>
		<a class="status padding-top" href="/team/{teamName}/{envName}/job/{jobName}/status">
			Status is unknown
		</a>
	{/if}
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
	a.status:hover {
		text-decoration: none;
	}
	a.padding-top {
		padding-top: 1rem;
	}
</style>
