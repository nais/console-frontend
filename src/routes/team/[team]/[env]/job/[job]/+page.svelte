<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import { Alert, Skeleton } from '@nais/ds-svelte-community';
	import Persistence from '../../app/[app]/Persistence.svelte';
	import type { PageData } from './$houdini';
	import Authentications from './Authentications.svelte';
	import Image from './Image.svelte';
	import NaisjobInstances from './Runs.svelte';
	import Schedule from './Schedule.svelte';
	import Secrets from './Secrets.svelte';
	import Status from './Status.svelte';
	import Traffic from './Traffic.svelte';

	export let data: PageData;
	$: ({ Job } = data);

	$: jobName = $page.params.job;
	$: env = $page.params.env;
	$: team = $page.params.team;
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
		<Status job={$Job.data.naisjob} />

		<Card columns={3}>
			<Image {job} />
		</Card>

		<Card columns={3} rows={1}>
			<Cost app={jobName} {env} {team} />
		</Card>

		<Card columns={3}>
			<h4>Schedule</h4>
			{#if job.schedule === PendingValue}
				<Skeleton variant="text" />
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
			<h4>Persistence</h4>
			<Persistence persistence={job.persistence} />
		</Card>
		<Card columns={4}>
			<h4>Authentications</h4>
			<Authentications {job} />
		</Card>
		{#if $Job.data.team.viewerIsMember || $Job.data.team.viewerIsOwner}
			<Card columns={4}>
				<h4>Secrets</h4>
				<Secrets />
			</Card>
		{/if}
	</div>
{/if}

<style>
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
