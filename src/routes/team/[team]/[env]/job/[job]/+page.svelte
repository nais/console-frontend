<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import type { PageData } from './$houdini';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Button } from '@nais/ds-svelte-community';
	import Schedule from './Schedule.svelte';
	import Traffic from './Traffic.svelte';
	import NaisjobInstances from './Runs.svelte';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { copyText } from 'svelte-copy';
	import { Clipboard } from '@nais/ds-svelte-community/icons';

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
	<div class="grid">
		<Card columns={3}>
			<h4>Status</h4>
			<div class="status">
				{#if $Job.data.naisjob.runs.length > 0}
					{#if $Job.data.naisjob.runs[0].failed === false}
						<SuccessIcon size="1.5rem" style="color: var(--a-icon-success)" />
						Last job completed successfully.
					{:else}
						<WarningIcon size="1.5rem" style="color: var(--a-icon-warning)" />
						Last job failed after {$Job.data.naisjob.runs[0].message} attempts.
					{/if}
				{:else}
					<WarningIcon size="1.5rem" style="color: var(--a-icon-warning)" />
					No jobs found.
				{/if}
			</div>
		</Card>
		<Card columns={3}>
			<h4>Schedule</h4>
			<Schedule schedule={String($Job.data.naisjob.schedule)} />
		</Card>
		<Card columns={3}>
			<h4>Deployed</h4>
			{#if $Job.data.naisjob.deployInfo.timestamp === PendingValue}
				<Loading />
			{:else if $Job.data.naisjob.deployInfo.timestamp === null}
				Never
			{:else}
				<Time time={$Job.data.naisjob.deployInfo.timestamp} distance={true} /><br />
				{#if $Job.data.naisjob.deployInfo.deployer && $Job.data.naisjob.deployInfo.url}
					<a href={$Job.data.naisjob.deployInfo.url}>Workflow</a> triggered by
					<a href="https://github.com/{$Job.data.naisjob.deployInfo.deployer}"
						>{$Job.data.naisjob.deployInfo.deployer}</a
					>.
				{/if}
			{/if}
		</Card>
		<Card columns={3}>
			<h4 class="image">
				Image <Button
					size="xsmall"
					on:click={() => {
						if ($Job.data?.naisjob.image !== PendingValue) {
							copyText($Job.data ? String($Job.data.naisjob.image) : '');
						}
					}}
				>
					<svelte:fragment slot="icon-left"><Clipboard /></svelte:fragment>
				</Button>
			</h4>
			{#if $Job.data.naisjob.image === PendingValue}
				<Loading />
			{:else}
				<div class="imageBreak">
					{$Job.data.naisjob.image}
				</div>
			{/if}
		</Card>
		<Card columns={12}>
			<h4>Runs</h4>
			<NaisjobInstances job={$Job.data.naisjob} />
		</Card>
		<Card columns={8}>
			<h4>Traffic policies</h4>
			<Traffic job={$Job.data.naisjob} />
		</Card>
	</div>
{/if}

<style>
	.status {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 1rem;
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
	.image {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.imageBreak {
		word-wrap: break-word;
	}
</style>
