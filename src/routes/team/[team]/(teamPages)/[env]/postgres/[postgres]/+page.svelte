<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import { Alert, CopyButton, HelpText, Link } from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		ExclamationmarkTriangleFillIcon,
		ExternalLinkIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ SqlInstance } = data);
	$: instance = $SqlInstance.data?.sqlInstance;
	$: teamName = $page.params.team;
	$: envName = $page.params.env;
	$: postgres = $page.params.postgres;

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $SqlInstance.errors}
	{#each distinctErrors($SqlInstance.errors) as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if instance && instance.id !== PendingValue}
	<div style="display: flex; align-items: center; column-gap: 1rem; margin-bottom: 1rem;">
		<div style="display: flex; align-items: center; column-gap: 0.5rem;">
			SQL Instance:
			<a
				href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectId}&supportedpurview=project"
				>{postgres}<ExternalLinkIcon title="Google Cloud Console" font-size="1.5rem" /></a
			>
		</div>
		<div style="display: flex; align-items: center; column-gap: 0.5rem;">
			<span>Version:</span>
			<span style="font-weight: bold">{instance.type}</span>
		</div>
		<div style="display: flex; align-items: center; column-gap: 0.5rem;">
			<span> Status: </span>
			{#if instance.isHealthy}
				<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
			{:else}
				<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
			{/if}
		</div>
		<div style="display: flex; align-items: center; column-gap: 0.5rem;">
			<span>HA:</span>
			{#if instance.highAvailability}
				<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
			{:else}
				<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
			{/if}
		</div>
	</div>
	<div class="grid">
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost
						<HelpText title="">Total SQL instance cost for the last 30 days.</HelpText>
					</h4>
					<p class="metric">
						€{Math.round(instance.cost)}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={instance.metrics.cpu.utilization / 100} />
				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization"
							>CPU utilization for the last elapsed hour for team.
						</HelpText>
					</h4>
					<p class="metric">
						{instance.metrics.cpu.utilization.toFixed(1)}% of {instance.metrics.cpu.cores.toLocaleString()}
						core(s)
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={instance.metrics.memory.utilization / 100} />
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization"
							>Memory utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{instance.metrics.memory.utilization.toFixed(1)}% of {prettyBytes(
							instance.metrics.memory.quotaBytes
						)}
					</p>
				</div>
			</div>
		</Card>

		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={instance.metrics.disk.utilization / 100} />
				</div>
				<div class="summary">
					<h4>
						Disk utilization
						<HelpText title="Current memory utilization"
							>Disk utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{instance.metrics.disk.utilization.toFixed(1)}% of {prettyBytes(
							instance.metrics.disk.quotaBytes
						)}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={8}>
			<h3>Information</h3>
			<div class="wrapper">
				<p class="title">Application:</p>
				<p class="content">
					{#if instance.app}
						Used by application: <a
							href="/team/{teamName}/{envName}/app/{instance.app.name.toString()}"
							>{instance.app.name}</a
						>
					{:else}
						<ExclamationmarkTriangleFillIcon
							style="color: var(--a-icon-warning)"
							title="The SQL instance does not belong to any application resource"
						/>
						The SQL instance does not belong to any application resource
					{/if}
				</p>
				<p class="title">Database version:</p>
				<p class="content">{instance.type}</p>
				<p class="title">Connection name:</p>
				<p class="content" style="display: flex; align-items: center;">
					{instance.connectionName}
					<CopyButton size="small" variant="action" copyText={instance.connectionName.toString()} />
				</p>
				<p class="title">Tier:</p>
				<p class="content">{instance.tier}</p>
			</div>
			<h4 style="margin-top: 1.5rem;">Documentation</h4>
			<ul>
				<li>
					<Link
						href="https://doc.nais.io/how-to-guides/persistence/postgres/?h=sql+in#upgrading-major-version"
						>Upgrading major version</Link
					>
				</li>
			</ul>
		</Card>
		<Card columns={4}>
			<h4 style="margin-bottom: 0.5rem;">Databases</h4>
			{#if !instance.databases.length}
				<p>The SQL instance does not have any databases.</p>
			{:else}
				<ul>
					{#each instance.databases as database}
						<li>{database.name}</li>
					{/each}
				</ul>
			{/if}
			<h4 style="margin-bottom: 0.5rem">Backup settings</h4>
			<div class="wrapper">
				<p style="flex: 50%">Automatic backups:</p>
				<p style="flex: 50%">
					{instance.backupConfiguration.enabled ? 'Enabled' : 'Disabled'}
				</p>
				{#if instance.backupConfiguration.enabled}
					<p style="flex: 50%">Backup start time:</p>
					<p style="flex: 50%">
						{instance.backupConfiguration.startTime}
					</p>
					{#if instance.backupConfiguration.retainedBackups}
						<p style="flex: 50%">Retained backups:</p>
						<p style="flex: 50%">{instance.backupConfiguration.retainedBackups}</p>
					{/if}
				{/if}
			</div>
		</Card>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	.wrapper {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}
	.wrapper p {
		margin: 0.4rem 0;
	}
	.title {
		flex: 20%;
	}
	.content {
		flex: 80%;
	}

	.summaryIcon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
		border: 1px solid var(--bg-color);
		border-radius: 5px;
	}

	.summary > h4 {
		display: flex;
		gap: 0.5rem;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}

	.metric {
		font-size: 1.5rem;
		margin: 0;
	}

	.summaryCard {
		display: flex;
		align-items: center;
		gap: 20px;
	}
</style>
