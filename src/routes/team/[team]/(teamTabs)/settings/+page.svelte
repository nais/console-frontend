<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { Button, Modal } from '@nais/ds-svelte';
	import type { PageData } from './$houdini';
	import { Eye, EyeSlash, ArrowsCirclepath, Clipboard } from '@nais/ds-svelte/icons';
	import { copyText } from 'svelte-copy';
	import Time from '$lib/Time.svelte';
	import { graphql } from '$houdini';
	import { page } from '$app/stores';
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
	$: showKey = false;
	$: showRotateKey = false;
	$: team = $page.params.team;
</script>

{#if teamSettings}
	<Card>
		<h3>{teamSettings.name}</h3>
		<h5>{teamSettings.description}</h5>
		<h4>Slack Channel: {teamSettings.slackChannel}</h4>
		<h4>Alert channels</h4>
		<dl>
			{#each teamSettings.slackAlertsChannels || [] as channel}
				<dt>{channel.env}:</dt>
				<dd>{channel.name}</dd>
			{:else}
				<dt>Warning:</dt>
				<dd>No alert channels</dd>
			{/each}
		</dl>
	</Card>
	<br />
	<Card>
		<h4>Deploy key</h4>
		<dl>
			<dt>Created:</dt>
			<dd><Time time={teamSettings?.deployKey?.created} distance={true} /></dd>
			<dt>Expires:</dt>
			<dd><Time time={teamSettings?.deployKey?.expires} distance={true} /></dd>
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
						{teamSettings?.deployKey?.key.replaceAll(/./g, '*')}
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
{/if}
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

<style>
	dt {
		font-weight: bold;
	}
	.deployKey {
		font-family: monospace;
		padding-bottom: 1rem;
	}
</style>
