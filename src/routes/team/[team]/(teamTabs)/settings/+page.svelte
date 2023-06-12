<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { Alert, Button, Modal } from '@nais/ds-svelte';
	import type { PageData } from './$houdini';
	import { Eye, EyeSlash, ArrowsCirclepath, Clipboard } from '@nais/ds-svelte/icons';
	import { copyText } from 'svelte-copy';
	import Time from '$lib/Time.svelte';
	import { graphql } from '$houdini';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	const rotateKey = graphql(`
		mutation RotateDeployKey($team: String!) {
			changeDeployKey(team: $team) {
				key
				created
				expires
			}
		}
	`);

	export let data: PageData;

	$: ({ TeamSettings } = data);

	$: teamSettings = $TeamSettings.data?.team;

	$: team = $page.params.team;

	let showKey = false;
	let showRotateKey = false;
</script>

{#if $TeamSettings.errors}
	<Alert variant="error">
		{#each $TeamSettings.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if teamSettings}
	<div style="margin-bottom: 1rem;">
		<Alert variant="info">
			Team settings currently managed by <a href="https://teams.nav.cloud.nais.io">Teams</a>
			<br />
			This functionality will be incorporated into this app eventually
		</Alert>
	</div>
	<Card>
		<h3>{team}</h3>
		{#if teamSettings.id === PendingValue}
			<Loading width="400px" />
		{:else}
			<i>{teamSettings.description}</i>
		{/if}
		{#if teamSettings.slackChannel !== PendingValue && teamSettings.slackChannel !== ''}
			<dl>
				<dh>Default Channel:</dh>
				<dd>{teamSettings.slackChannel}</dd>
			</dl>
		{/if}
		{#if teamSettings.slackAlertsChannels && teamSettings.slackAlertsChannels.length > 0 && teamSettings.slackAlertsChannels[0].env !== PendingValue}
			<dl>
				<dh>Overridden channels:</dh>
				{#each teamSettings.slackAlertsChannels as channel}
					<dt>{channel.env}:</dt>
					<dd>{channel.name}</dd>
				{/each}
			</dl>
		{/if}
	</Card>
	<br />
	<Card>
		<h3>Deploy key</h3>
		<dl>
			<dt>Created:</dt>
			{#if teamSettings.deployKey.key === PendingValue}
				<dd><Loading /></dd>
			{:else}
				<dd><Time time={teamSettings.deployKey.created} distance={true} /></dd>
			{/if}
			<dt>Expires:</dt>
			{#if teamSettings.deployKey.expires === PendingValue}
				<dd><Loading /></dd>
			{:else}
				<dd><Time time={teamSettings?.deployKey?.expires} distance={true} /></dd>
			{/if}
			<dt>Key:</dt>
			<dd>
				<div class="deployKey">
					{#if showKey}
						{teamSettings?.deployKey?.key}
						<Button
							size="xsmall"
							variant="tertiary"
							on:click={() => {
								showKey = !showKey;
							}}
						>
							<svelte:fragment slot="icon-left"><EyeSlash /></svelte:fragment></Button
						>
					{:else}
						{#if teamSettings.deployKey.key === PendingValue}
							<dd><Loading /></dd>
						{:else}
							{teamSettings?.deployKey?.key.replaceAll(/./g, '*')}
						{/if}
						<Button
							size="xsmall"
							variant="tertiary"
							on:click={() => {
								showKey = !showKey;
							}}
						>
							<svelte:fragment slot="icon-left"><Eye /></svelte:fragment></Button
						>
					{/if}
				</div>
				<Button
					size="xsmall"
					on:click={() => {
						if (teamSettings?.deployKey?.key === PendingValue) return;
						copyText(teamSettings?.deployKey?.key || '');
					}}
				>
					<svelte:fragment slot="icon-left"><Clipboard /></svelte:fragment>
					Copy key</Button
				>
				<Button
					size="xsmall"
					variant="danger"
					on:click={() => {
						showRotateKey = !showRotateKey;
					}}
				>
					<svelte:fragment slot="icon-left"><ArrowsCirclepath /></svelte:fragment>
					Rotate key</Button
				>
			</dd>
		</dl>
	</Card>
	{#if browser}
		<Modal bind:open={showRotateKey} closeButton={false}>
			<h3>Rotate deploy key</h3>
			<p>Are you sure you want to rotate the deploy key?</p>
			<Button
				on:click={() => {
					showRotateKey = !showRotateKey;
				}}
			>
				Cancel</Button
			>
			<Button
				variant="danger"
				on:click={() => {
					showRotateKey = !showRotateKey;
					rotateKey.mutate({ team });
				}}
			>
				Rotate key</Button
			>
		</Modal>
	{/if}
{/if}

<style>
	dt {
		font-weight: bold;
	}
	.deployKey {
		font-family: monospace;
		padding-bottom: 1rem;
	}
	h3 {
		margin-bottom: 0.5rem;
	}
	i {
		margin-bottom: 0.5rem;
	}
</style>
