<script lang="ts">
	import { browser } from '$app/environment';
	import { graphql, type WorkloadLogSubscriptionFilter } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { createEventDispatcher, onDestroy, tick, untrack } from 'svelte';
	import type { SvelteSet } from 'svelte/reactivity';
	import { get } from 'svelte/store';

	interface Props {
		app?: string | undefined;
		job?: string | undefined;
		team: string;
		env: string;
		instances: SvelteSet<string>;
		running?: boolean;
		showName?: boolean;
		showTime?: boolean;
		showLevel?: boolean;
	}

	let {
		app = undefined,
		job = undefined,
		team,
		env,
		instances,
		running = false,
		showName = true,
		showTime = true,
		showLevel = true
	}: Props = $props();

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
	let logs: LogLine[] = $state([]);

	function getLogLevel(message: string) {
		const logLevel = message.match(/"level":"(\w+)"/);
		if (logLevel) {
			return logLevel[1].toUpperCase();
		}
		return 'INFO';
	}

	let logview: HTMLElement | undefined = $state();

	const scrollToBottom = async () => {
		if (!logview) {
			return;
		}
		await tick();
		logview?.scroll({
			top: logview.scrollHeight
		});
	};

	const updates = graphql(`
		subscription Logs($filter: WorkloadLogSubscriptionFilter!) {
			workloadLog(filter: $filter) {
				time
				message
				instance
			}
		}
	`);

	let subscribed = false;
	const start = async () => {
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
		if (instances.size === 0) {
			return;
		}
		logs = [];

		let filter: WorkloadLogSubscriptionFilter;

		if (app && app != '') {
			filter = {
				application: app,
				environment: env,
				team: team,
				instances: Array.from(instances)
			};
		} else if (job && job != '') {
			filter = {
				job: job,
				environment: env,
				team: team,
				instances: Array.from(instances)
			};
		} else {
			return;
		}

		updates.listen({
			filter: filter
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
					if (result.data.workloadLog.instance === 'api') {
						updates.unlisten();
						return;
					}
					const wl = result.data.workloadLog;
					untrack(() => {
						logs = [...logs.slice(-maxLines), wl];
						logs.sort((a, b) => a.time.getTime() - b.time.getTime());
					});
				}
				// logs.sort((a, b) => a.time.getTime() - b.time.getTime());
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

	$effect(() => {
		start();
	});

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

<!--p>
	<a
		href="https://grafana.nav.cloud.nais.io/a/grafana-lokiexplore-app/explore/service_namespace/{team}/logs?from=now-15m&to=now&var-ds={env}-loki&var-filters=service_namespace%7C%3D%7C{team}&var-filters=service_name%7C%3D%7C{app}&var-fields=&var-levels=&patterns=%5B%5D&var-metadata=&var-patterns=&var-lineFilterV2=&var-lineFilters=&timezone=browser&urlColumns=%5B%5D&visualizationType=%22logs%22&displayedFields=%5B%5D&sortOrder=%22Descending%22&wrapLogMessage=false"
		>Explore logs in Grafana</a
	>
</p-->

{#if $updates.errors && $updates.errors.length > 0}
	<div class="line">
		<br /><br />
		<code>Failed to fetch logs: Event error(s): </code>
	</div>
	{#each $updates.errors as error (error)}
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
		{#each logs as log (log)}
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
		<div use:intersect id="bottom"></div>
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
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
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
