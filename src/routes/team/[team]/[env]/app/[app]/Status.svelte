<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type AppStatus } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import UnknownIcon from '$lib/icons/UnknownIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';

	$: teamName = $page.params.team;
	$: envName = $page.params.env;
	$: appName = $page.params.app;

	export let app: AppStatus;
	$: data = fragment(
		app,
		graphql(`
			fragment AppStatus on App {
				appState @loading {
					state @loading
				}
			}
		`)
	);
</script>

<div class="wrapper">
	<h4>Status</h4>
	<a class="status" href="/team/{teamName}/{envName}/app/{appName}/status">
		{#if $data.appState.state == PendingValue}
			<Loading />
		{:else if $data.appState.state === 'NAIS'}
			<Nais
				size="5rem"
				style="color: var(--a-icon-success)"
				aria-label="Application is nais"
				role="image"
			/>
		{:else if $data.appState.state === 'FAILING'}
			<WarningIcon
				size="5rem"
				style="color: var(--a-icon-danger)"
				aria-label="Application is failing"
				role="image"
			/>
		{:else if $data.appState.state === 'NOTNAIS'}
			<Nais
				size="5rem"
				style="color: var(--a-icon-warning)"
				aria-label="Application is not nais"
				role="image"
			/>
		{:else if $data.appState.state === 'UNKNOWN'}
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
