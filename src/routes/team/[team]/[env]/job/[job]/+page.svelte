<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	//import Authentications from '../../../../../../../fridge/routes/team/[team]/[env]/job/[job]/Authentications.svelte';
	import { page } from '$app/stores';
	import Image from '$lib/components/Image.svelte';
	import JobCost from '$lib/components/JobCost.svelte';
	import Persistence from '$lib/components/Persistence.svelte';
	import Traffic from '$lib/components/Traffic.svelte';
	import type { PageData } from './$houdini';
	import Runs from './Runs.svelte';
	import Schedule from './Schedule.svelte';
	import Secrets from './Secrets.svelte';
	import Status from './Status.svelte';

	export let data: PageData;
	$: ({ Job } = data);

	$: jobName = $page.params.job;
	$: environment = $page.params.env;
	$: team = $page.params.team;
</script>

{#if $Job.errors}
	<Alert variant="error">
		{#each $Job.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $Job.data}
	{@const job = $Job.data.team.environment.job}
	<div class="grid">
		<Status {job} />

		<Card columns={3}>
			<Image workload={job} />
		</Card>

		<Card columns={3} rows={1}>
			<JobCost job={jobName} {environment} {team} />
		</Card>

		<Card columns={3}>
			<h4>Schedule</h4>
			<Schedule schedule={job.schedule} />
		</Card>
		<Card columns={12}>
			<h4>Runs</h4>
			<Runs {job} />
		</Card>
		<Card columns={12}>
			<h4>Traffic policies</h4>
			<Traffic workload={job} />
		</Card>

		<Card columns={4}>
			<h4>Persistence</h4>
			<Persistence workload={job} />
		</Card>
		<Card columns={4}>
			<h4>Authentications</h4>
			<!--Authentications {job} /-->
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
