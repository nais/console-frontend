<script lang="ts">
	import Card from '$lib/Card.svelte';

	import type { PageData } from './$houdini';
	import { page } from '$app/stores';
	import { Alert } from '@nais/ds-svelte-community';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';

	export let data: PageData;
	let instanceName = $page.params.instance;
	$: ({ AppLog } = data);

	function getLogLevel(message: string) {
		const logLevel = message.match(/"level":"(\w+)"/);
		if (logLevel) {
			return logLevel[1].toUpperCase();
		}
		return 'INFO';
	}

	// onload function to scroll log to bottom
	function scrollToBottom() {
		const log = document.querySelector('.log');
		if (log) {
			log.scrollTop = log.scrollHeight;
		}
	}
</script>

{#if $AppLog.errors}
	<Alert variant="error">
		{#each $AppLog.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $AppLog.data}
	<Card>
		{#if $AppLog.data.app.name === PendingValue}
			{#each new Array(5) as _, index}
				<div class="log" id="ll-{index}">
					<div class="logline">
						<a class="index" href="#ll-{index}">{index}</a>
						<span class="timestamp">
							<Loading />
						</span>
						<span class="level"><Loading /></span>
						<span class="message">
							<Loading />
						</span>
					</div>
				</div>
			{/each}
		{:else}
			{#each $AppLog.data.app.instances as instance}
				{#if instanceName === instance.name}
					<h4>Last {instance.log.length} log lines for {instanceName}</h4>
					<div class="log">
						{#each instance.log as log, index}
							<div on:load={scrollToBottom()} class="logline" id="ll-{index}">
								<a class="index" href="#ll-{index + 1}">{index + 1}</a>
								<span class="timestamp">
									{log.time.toLocaleString('en-GB')}
								</span>
								<span class="level {getLogLevel(log.message)}">{getLogLevel(log.message)}</span>
								<span class="message">
									{log.message}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			{/each}
		{/if}
	</Card>
{/if}

<style>
	.log {
		color: rgb(31, 35, 40);
		color-scheme: light;
		display: block;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono',
			monospace;
		font-size: 12px;
		line-height: 18px;
		padding-bottom: 4px;
		padding-top: 4px;
		overflow: auto;
		height: 45vw;
	}

	.logline {
		display: flex;
		flex-direction: row;
	}
	.log a {
		color: silver;
		text-decoration: none;
		min-width: 20px;
	}

	.timestamp {
		color: rgb(0, 0, 0);
		display: inline-block;
		margin-right: 8px;
		min-width: 160px;
		text-align: right;
	}

	.level {
		color: rgb(0, 0, 0);
		display: inline-block;
		margin-right: 8px;
		min-width: 50px;
		text-align: left;
	}

	.ERROR {
		color: rgb(255, 0, 0);
	}

	.WARN {
		color: rgb(255, 165, 0);
	}

	.message {
		overflow-wrap: break-word;
		overflow-x: auto;
	}
</style>
