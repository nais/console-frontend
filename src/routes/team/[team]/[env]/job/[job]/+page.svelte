<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import Authentications from './Authentications.svelte';
	import Image from './Image.svelte';
	import NaisjobInstances from './Runs.svelte';
	import Schedule from './Schedule.svelte';
	import Storage from './Storage.svelte';
	import Traffic from './Traffic.svelte';

	export let data: PageData;
	$: ({ Job } = data);

	$: env = $page.params.env;
</script>

{#if $Job.errors}
	<Alert variant="error">
		{#each $Job.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $Job.data}
	{@const job = $Job.data.naisjob}
	<div class="grid">
		<Card columns={2}>
			<h4>Status</h4>
			<div class="status">
				{#if job.runs.length > 0}
					{#if job.runs[0].name === PendingValue}
						<Loading />
					{:else if job.runs[0].failed === false}
						<Nais size="1.5rem" style="color: var(--a-icon-success)" />
						Last job was completed naisly.
					{:else}
						<WarningIcon size="1.5rem" style="color: var(--a-icon-danger)" />
						Last job failed non-naisly {job.runs[0].message} attempts.
					{/if}
				{:else}
					<WarningIcon size="1.5rem" style="color: var(--a-icon-warning)" />
					No jobs found.
				{/if}
			</div>
		</Card>

		<Card columns={4}>
			<h4>Last activity</h4>
			{#if job.deployInfo.timestamp === PendingValue}
				<Loading />
			{:else if job.deployInfo.timestamp === null}
				Not available
			{:else}
				<a href={job.deployInfo.url}>Deployed</a>
				<Time time={job.deployInfo.timestamp} distance={true} />
				{#if job.deployInfo.deployer && job.deployInfo.url}
					by
					<a href="https://github.com/{job.deployInfo.deployer}">{job.deployInfo.deployer}</a>.
				{/if}
			{/if}
		</Card>
		<Card columns={6}>
			<Image {job} />
		</Card>
		<Card columns={6}>
			<h4>Schedule</h4>
			{#if job.schedule === PendingValue}
				<Loading />
			{:else}
				<Schedule schedule={String(job.schedule)} />
			{/if}
		</Card>
		<Card columns={12}>
			<h4>Runs</h4>
			<NaisjobInstances {job} />
		</Card>
		<Card columns={12}>
			<h4>Traffic policies</h4>
			<Traffic {job} />
		</Card>

		<Card columns={4}>
			<h4>Storage</h4>
			<Storage {job} />
		</Card>
		<Card columns={4}>
			<h4>Authentications</h4>
			<Authentications {job} />
		</Card>
	</div>
{/if}

<style>
	.status {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 0.5rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	h4 {
		font-weight: 400;
		margin-bottom: 0.5rem;
	}
</style>
