<script lang="ts">
	import { browser } from '$app/environment';
	import { graphql } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { createEventDispatcher, onDestroy, tick } from 'svelte';
	import { get } from 'svelte/store';

	export let app: string | undefined = undefined;
	export let job: string | undefined = undefined;
	export let team: string;
	export let env: string;
	export let instances: Set<string>;
	export let running = false;
	export let showName = true;
	export let showTime = true;
	export let showLevel = true;

	const dispatch = createEventDispatcher<{ fetching: boolean; scrolledUp: null }>();

	type LogLine = {
		readonly time: Date;
		readonly message: string;
		readonly instance: string;
	};

	function intersect(el: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) {
						dispatch('scrolledUp');
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

	const maxLines = 255;
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

	let subscribed = false;
	const start = async (
		app: string | undefined,
		job: string | undefined,
		env: string,
		team: string,
		instances: string[],
		running: boolean
	) => {
		if (!browser) {
			return;
		}
		if (!running) {
			await updates.unlisten();
			return;
		}
		if (get(updates).fetching) {
			await updates.unlisten();
		}
		if (instances.length === 0) {
			return;
		}
		logs = [];

		updates.listen({
			input: { app: app, job: job, env: env, team: team, instances: instances }
		});

		if (!subscribed) {
			let lastEvent: boolean | null = null;
			const publishEvent = async (event: boolean) => {
				if (lastEvent !== event) {
					await tick();
					dispatch('fetching', event);
					lastEvent = event;
				}
			};

			updates.subscribe((result) => {
				publishEvent(result.fetching);
				if (result.data) {
					if (result.data.log.instance === 'console-backend') {
						updates.unlisten();
						return;
					}
					if (
						(logs.length > 1 &&
							result.data.log.instance !== logs[-1].instance &&
							result.data.log.time !== logs[-1].time &&
							result.data.log.message !== logs[-1].message) ||
						logs.length === 0
					) {
						logs = [...logs.slice(-maxLines), result.data.log];
					}
				}
				logs.sort((a, b) => a.time.getTime() - b.time.getTime());
				scrollToBottom();
			});
			subscribed = true;
		}
	};

	// Destroy handler is a bit hacky in case the user navigates from
	// one log viewer to another, without first navigating to a different url.
	const destroy = () => {
		updates.unlisten();
	};

	onDestroy(destroy);

	$: start(app, job, env, team, Array.from(instances), running);

	function renderInstanceName(i: string) {
		if (app) {
			return i.slice(app.length + 1);
		}
		if (job) {
			return i.slice(job.length + 1);
		}
		return i;
	}
</script>

{#if $updates.errors && $updates.errors.length > 0}
	<div class="line">
		<br /><br />
		<code>Failed to fetch logs: Event error(s): </code>
	</div>
	{#each $updates.errors as error}
		<div class="line"><code>{error.message}</code></div>
	{/each}
{:else if instances.size === 0 && job !== undefined}
	<div id="log" bind:this={logview}>
		<div class="logline"><p>No runs found</p></div>
	</div>
{:else if instances.size === 0 && app !== undefined}
	<div id="log" bind:this={logview}>
		<div class="logline"><p>No instances found</p></div>
	</div>
{:else}
	<div id="log" bind:this={logview}>
		{#each logs as log}
			<div class="logline {getLogLevel(log.message)}">
				{#if showTime}
					<span class="timestamp">
						<Time time={log.time} dateFormat="yyyy-MM-dd HH:mm:ss" />
					</span>
				{/if}
				{#if showLevel}
					<span class="level">{getLogLevel(log.message)}</span>
				{/if}
				{#if showName}
					<span class="instance">
						{renderInstanceName(log.instance)}
					</span>
				{/if}
				<pre class="message">{log.message}</pre>
			</div>
		{/each}
		<div use:intersect id="bottom" />
	</div>
{/if}

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
		line-height: 1rem;
		margin-top: 1rem;
		padding: 0rem 1rem 1rem 1rem;
		overflow: auto;
		height: 45vw;
	}

	p {
		margin: 1rem;
	}

	.logline {
		display: flex;
		flex-direction: row;
		margin-right: 8px;
	}

	.logline.WARN,
	.logline.WARNING {
		background-color: var(--a-surface-warning-subtle);
		color: var(--a-text-on-warning);
	}

	.logline.ERROR {
		background-color: var(--a-surface-danger-subtle);
		color: var(--a-text-danger);
	}

	.timestamp {
		display: inline-block;
		min-width: 148px;
	}

	.level {
		display: inline-block;
		margin-right: 8px;
		min-width: 50px;
		text-align: left;
	}

	.instances {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.instance {
		min-width: 120px;
		margin-right: 8px;
	}

	.message {
		display: inline-block;
		word-break: break-word;
		white-space: pre-wrap;
		margin: 0;
	}
</style>
