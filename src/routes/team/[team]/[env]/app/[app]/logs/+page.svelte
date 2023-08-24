<script lang="ts">
	import { graphql } from '$houdini';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onDestroy, tick } from 'svelte';
	import { get } from 'svelte/store';
	import HumanTime from '$lib/HumanTime.svelte';
	import { Button } from '@nais/ds-svelte-community';

	type LogLine = {
		readonly time: Date;
		readonly message: string;
		readonly instance: string;
	};

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: app = $page.params.app;

	function intersect(el: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) {
						updates.unlisten();
					}
				});
			},
			{
				root: document.querySelector('#log'),
				rootMargin: '0px',
				threshold: 0
			}
		);

		observer.observe(el);
		return {
			destroy: () => {
				try {
					observer.disconnect();
				} catch (e) {
					console.error(e);
				}
			}
		};
	}

	const maxLines = 99;
	let logs: LogLine[] = [];

	function getLogLevel(message: string) {
		const logLevel = message.match(/"level":"(\w+)"/);
		if (logLevel) {
			return logLevel[1].toUpperCase();
		}
		return 'INFO';
	}

	let logview: HTMLElement;

	const scrollToBottom = async () => {
		if (!logview) {
			return;
		}
		await tick();
		logview.scroll({
			top: logview.scrollHeight
		});
	};

	const updates = graphql(`
		subscription Logs($input: LogSubscriptionInput!) {
			log(input: $input) {
				time
				message
				instance
			}
		}
	`);

	const start = async (app: string, env: string, team: string) => {
		if (!browser) {
			return;
		}
		if (get(updates).fetching) {
			await updates.unlisten();
		}

		updates.listen({ input: { app: app, env: env, team: team } });
		updates.subscribe((result) => {
			if (result.data) {
				logs = [...logs.slice(-maxLines), result.data.log];
			}
			scrollToBottom();
		});
	};

	// Destroy handler is a bit hacky in case the user navigates from
	// one log viewer to another, without first navigating to a different url.
	const destroy = () => {
		updates.unlisten();
	};

	onDestroy(destroy);

	$: start(app, env, team);
	$updates.data?.log.instance;
</script>

<div class="topbar">
	{#if $updates.fetching}
		<Button on:click={() => updates.unlisten()}>Pause</Button>
	{:else}
		<Button on:click={() => start(app, env, team)}>Restart</Button>
	{/if}
	{#if $updates.fetching}
		<span>Streaming logs...</span>
	{/if}
</div>
{#if $updates.errors && $updates.errors.length > 0}
	<div class="line">
		<br /><br />
		<code>Failed to fetch logs: Event error(s): </code>
	</div>
	{#each $updates.errors as error}
		<div class="line"><code>{error.message}</code></div>
	{/each}
{/if}

<div id="log" bind:this={logview}>
	{#each logs as log, index}
		<div class="logline">
			<span class="timestamp">
				<HumanTime time={log.time} dateFormat="yyyy-MM-dd HH:mm:ss" />
			</span>
			<span class="level {getLogLevel(log.message)}">{getLogLevel(log.message)}</span>
			<span class="instance">
				{log.instance}
			</span>
			<span class="message">
				{log.message}
			</span>
		</div>
	{/each}
	<div use:intersect id="bottom" />
</div>

<style>
	.topbar {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	#log {
		border: 1px solid var(--a-border-subtle);
		background-color: var(--a-surface-default);
		display: block;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono',
			monospace;
		font-size: 12px;
		line-height: 18px;
		margin-top: 18px;
		padding-bottom: 4px;
		padding-top: 4px;
		overflow: auto;
		height: 45vw;
	}

	.logline {
		display: flex;
		flex-direction: row;
		margin-right: 8px;
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
		width: 50px;
		text-align: left;
	}

	.ERROR {
		color: rgb(255, 0, 0);
	}

	.WARN {
		color: rgb(255, 165, 0);
	}

	.instance {
		width: 120px;
		margin-right: 8px;
	}

	.message {
		word-break: break-word;
	}
</style>
