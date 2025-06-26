<script lang="ts">
	import { page } from '$app/state';
	import EChart from '$lib/chart/EChart.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { EChartsOption } from 'echarts';

	import { UtilizationResourceType, type ResourceUtilizationForApp$result } from '$houdini';
	import { docURL } from '$lib/doc';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import {
		euroValueFormatter,
		formatKubernetesCPU,
		formatKubernetesMemory
	} from '$lib/utils/formatters';
	import { round, yearlyOverageCost } from '$lib/utils/resources';
	import { changeParams } from '$lib/utils/searchparams';
	import { visualizationColors } from '$lib/visualizationColors';
	import {
		BodyLong,
		BodyShort,
		Heading,
		Loader,
		ReadMore,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleGroup,
		ToggleGroupItem,
		Tr
	} from '@nais/ds-svelte-community';
	import { WalletFillIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { ResourceUtilizationForApp } = $derived(data);

	type resourceUsage = {
		readonly timestamp: Date;
		readonly value: number;
		readonly instance?: string;
	}[];

	const interval = $derived(page.url.searchParams.get('interval') ?? '7d');

	const deploymentIcon =
		'path://M19.606 3.758A7.82 7.82 0 0 0 12.97 5.97l-1.78 1.78H6.5a.75.75 0 0 0-.53.22l-3 3a.75.75 0 0 0 .383 1.265l3.578.716c.782.156 1.5.484 2.114.943L7.47 15.47a.75.75 0 1 0 1.06 1.06l1.576-1.575c.459.614.787 1.332.943 2.114l.716 3.578a.75.75 0 0 0 1.265.383l3-3a.75.75 0 0 0 .22-.53v-4.69l1.78-1.78a7.82 7.82 0 0 0 2.212-6.636.75.75 0 0 0-.636-.636m-8.431 10.128a6.74 6.74 0 0 1 1.345 2.89l.44 2.203 1.79-1.79V12.5a.75.75 0 0 1 .22-.53l2-2a6.32 6.32 0 0 0 1.843-4.783A6.32 6.32 0 0 0 14.03 7.03l-2 2a.75.75 0 0 1-.53.22H6.81l-1.789 1.79 2.204.44a6.74 6.74 0 0 1 2.89 1.345l1.355-1.355a.75.75 0 1 1 1.06 1.06z';
	const scaleUpIcon =
		'path://M12.53 4.47a.75.75 0 0 0-1.06 0l-3.5 3.5a.75.75 0 0 0 .53 1.28h7a.75.75 0 0 0 .53-1.28zM12 6.06l1.69 1.69h-3.38zm-3.5 8.69a.75.75 0 0 0-.53 1.28l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-.53-1.28zm3.5 3.19-1.69-1.69h3.38z';

	type groupedLogs = {
		timestamp: number;
		logs: ResourceUtilizationForApp$result['team']['environment']['application']['activityLog']['nodes'];
	};

	/**
	 * groupedActivityLog returns a grouped array of activity logs, where each group contains logs that occurred within the same 10-minute interval.
	 * @param activityLog
	 */
	function groupedActivityLog(
		activityLog:
			| ResourceUtilizationForApp$result['team']['environment']['application']['activityLog']
			| null
	) {
		if (!activityLog) {
			return [];
		}
		let intervalSeconds: number;
		switch (interval) {
			case '1h':
				intervalSeconds = 1 * 60; // 1 minute
				break;
			case '6h':
				intervalSeconds = 4 * 60; // 4 minutes
				break;
			case '1d':
				intervalSeconds = 10 * 60; // 10 minutes
				break;
			case '30d':
				intervalSeconds = 12 * 60 * 60; // 12 hours
				break;
			default:
				intervalSeconds = 1.5 * 60 * 60; // 1.5 hour
				break;
		}

		return activityLog.nodes.reduceRight((acc, log) => {
			let logTime = Math.floor(log.createdAt.getTime() / 1000);
			if (acc.length > 0 && logTime - acc.at(-1)!.timestamp < intervalSeconds) {
				acc.at(-1)!.logs.push(log);
			} else {
				acc.push({
					timestamp: logTime,
					logs: [log]
				});
			}
			return acc;
		}, [] as groupedLogs[]);
	}

	function formatAnnotation(log: groupedLogs) {
		if (log.logs.length === 0) {
			return '';
		}
		const div = document.createElement('div');
		div.style.color = 'var(--ax-text-neutral)';
		log.logs.forEach((l) => {
			if (l.__typename == 'DeploymentActivityLogEntry') {
				div.innerHTML += `<div>${format(l.createdAt, 'dd/MM/yyyy HH:mm')} - New release</div>`;
			} else if (l.__typename == 'ApplicationScaledActivityLogEntry') {
				div.innerHTML += `<div>${format(l.createdAt, 'dd/MM/yyyy HH:mm')} - Scaled ${l.appScaled.direction} to ${l.appScaled.newSize}</div>`;
			} else {
				div.innerHTML += `<div>${format(l.createdAt, 'dd/MM/yyyy HH:mm')} - ${l.__typename}</div>`;
			}
		});
		return div.outerHTML;
	}

	function formatTooltip(valueFormatter: (value: number) => string) {
		return (value: CallbackDataParams[] | CallbackDataParams) => {
			const dot = (color: string) =>
				`<div style="height: 8px; width: 8px; border-radius: 50%; background-color: ${color};"></div>`;
			const div = document.createElement('div');
			div.style.color = 'var(--ax-text-neutral)';

			const fomattedTime = () => {
				if (Array.isArray(value)) {
					if (Array.isArray(value[0]?.value)) {
						return format(value[0].value[0] as number, 'dd/MM/yyyy HH:mm');
					} else {
						return format(value[0].value as Date, 'dd/MM/yyyy HH:mm');
					}
				} else if (Object.keys(value).includes('value') && value.value) {
					return format(value.value as Date, 'dd/MM/yyyy HH:mm');
				} else if (value.data && typeof value.data == 'object' && 'xAxis' in value.data) {
					return format(value.data.xAxis as Date, 'dd/MM/yyyy HH:mm');
				}
			};

			div.innerHTML += `
		<div>${fomattedTime()}</div>
		<hr style="border: none; height: 1px; background-color: var(--ax-border-neutral-subtle);" />`;

			if (!Array.isArray(value)) {
				if (value.componentType == 'markLine' || value.componentType == 'markPoint') {
					return value.name;
				}
				return '';
			}

			div.innerHTML += `
				<div style="display: grid; grid-template-columns: auto auto; column-gap: 0.5rem;">
					${value
						?.map(
							(v) =>
								`<div style="display: flex; align-items: center; gap: 0.25rem;">${dot(
									v.color?.toString() ?? ''
								)}${v.seriesName}</div><div style="text-align: right;">${valueFormatter(
									(Array.isArray(v.value) ? v.value[1] : null) as number
								)}</div>`
						)
						.join('')}
				</div>
			`;
			return div;
		};
	}

	function options(
		data: resourceUsage,
		request: resourceUsage,
		limit?: resourceUsage,
		activityLog: groupedLogs[] | null = null,
		valueFormatter: (value: number) => string = (value: number) =>
			value == null ? '-' : value.toLocaleString('en-GB', { maximumFractionDigits: 4 })
	): EChartsOption {
		const safeData = data ?? [];
		const safeRequest = request ?? [];
		const safeLimit = limit ?? [];

		const opts = {
			grid: {
				bottom: 20,
				top: 16,
				left: 80,
				right: 60
			},
			animation: false,
			tooltip: {
				trigger: 'axis',
				formatter: formatTooltip(valueFormatter),
				axisPointer: {
					animation: false
				}
			},
			xAxis: {
				type: 'time',
				boundaryGap: false,
				axisLabel: { formatter: { month: '{MMM} {d}', day: '{dd}.{MM}' } }
			},
			yAxis: {
				type: 'value',
				axisLabel: {
					formatter: valueFormatter
				}
			},
			series: [
				...Array.from(new Set(safeData.map((d) => d.instance))).map((instance, index) => ({
					name: instance,
					type: 'line',
					z: 10,
					data: safeData
						.filter((d) => d.instance === instance)
						.map((d) => [d.timestamp.getTime(), d.value]),
					showSymbol: false,
					color: visualizationColors[index % visualizationColors.length],
					areaStyle: {
						opacity: 0.2
					}
				})),
				...Array.from(new Set(safeRequest.map((d) => d.instance))).map((instance) => ({
					name: 'Request',
					type: 'line',
					z: 10,
					data: safeRequest
						.filter((d) => d.instance === instance)
						.map((d) => [d.timestamp.getTime(), d.value]),
					showSymbol: false,
					color: requestColor,
					lineStyle: {
						color: requestColor,
						type: 'solid'
					},
					endLabel: {
						offset: [0, safeRequest.at(-1)?.value === safeLimit.at(-1)?.value ? 6 : 0],
						formatter: 'Request',
						position: 'end',
						color: requestColor,
						show: true
					}
				})),
				...Array.from(new Set(safeLimit.map((d) => d.instance))).map((instance) => ({
					name: 'Limit',
					type: 'line',
					z: 10,
					data: safeLimit
						.filter((d) => d.instance === instance)
						.map((d) => [d.timestamp.getTime(), d.value]),
					showSymbol: false,
					color: limitColor,
					lineStyle: { color: limitColor, type: 'dashed' },
					endLabel: {
						offset: [0, safeRequest.at(-1)?.value === safeLimit.at(-1)?.value ? -6 : 0],
						formatter: 'Limit',
						position: 'end',
						color: limitColor,
						show: true
					}
				}))
			]
		} as EChartsOption;

		let startTime = Infinity;
		let endTime = 0;
		safeData.forEach((d) => {
			if (d.timestamp.getTime() < startTime) {
				startTime = Math.floor(d.timestamp.getTime() / 1000);
			}
			if (d.timestamp.getTime() > endTime) {
				endTime = Math.floor(d.timestamp.getTime() / 1000);
			}
		});

		if (activityLog && Array.isArray(opts.series)) {
			opts.series = [
				{
					type: 'line',
					z: -10,
					markPoint: {
						animation: false,
						symbolSize: 16,
						tooltip: {
							trigger: 'item'
						},
						data: activityLog
							.map((log) => {
								let logTime = log.timestamp;

								if (endTime < logTime || startTime > logTime) {
									return null;
								}
								const hasDeployment = log.logs.some(
									(l) => l.__typename == 'DeploymentActivityLogEntry'
								);
								return {
									symbol: hasDeployment ? deploymentIcon : scaleUpIcon,
									name: formatAnnotation(log),
									xAxis: logTime * 1000,
									y: '10'
								};
							})
							.filter((d) => d !== null),
						label: {
							show: false
						},
						itemStyle: {
							color: themeSwitch.theme == 'dark' ? '#777f8d' : '#6f7785'
						}
					},
					markLine: {
						animation: false,
						symbol: 'none',
						lineStyle: {
							type: 'solid',
							color: themeSwitch.theme == 'dark' ? '#777f8d' : '#6f7785'
						},
						tooltip: {
							trigger: 'item'
						},
						label: {
							show: false
						},
						data: activityLog
							.map((log) => {
								let logTime = log.timestamp;

								if (endTime < logTime || startTime > logTime) {
									return null;
								}
								return {
									name: formatAnnotation(log),
									xAxis: logTime * 1000
								};
							})
							.filter((d) => d !== null)
					}
				},
				...opts.series
			];
		}

		return opts;
	}

	const limitColor = '#DE2E2E';
	const requestColor = '#838C9A';

	function isIn10PercentRange(n: number, target: number): boolean {
		const lowerBound = target * 0.9; // 10% less than the target
		const upperBound = target * 1.1; // 10% more than the target
		return n >= lowerBound && n <= upperBound;
	}

	const cpuReqRecommendation = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.utilization.recommendations
			.cpuRequestCores ?? 0
	);

	const cpuReq = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.resources.requests.cpu ?? 0
	);

	const cpuLimit = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.resources.limits.cpu
	);

	const memReqRecommendation = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.utilization.recommendations
			.memoryRequestBytes ?? 0
	);

	const memReq = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.resources.requests.memory ?? 0
	);
	const memLimit = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.resources.limits.memory ?? 0
	);
	const memLimitRecommendation = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.utilization.recommendations
			.memoryLimitBytes ?? 0
	);
</script>

<GraphErrors errors={$ResourceUtilizationForApp.errors} />

<div class="wrapper">
	{#if $ResourceUtilizationForApp.data}
		{@const utilization = $ResourceUtilizationForApp.data.team.environment.application.utilization}
		{@const activityLog = groupedActivityLog(
			$ResourceUtilizationForApp.data.team.environment.application.activityLog
		)}
		<div class="grid">
			<div class="card">
				<Heading level="2" size="medium" spacing
					><WalletFillIcon class="heading-aligned-icon" /> Cost of Unutilized CPU</Heading
				>
				<BodyShort spacing
					>Estimate of annual cost of unutilized CPU for application <strong
						>{$ResourceUtilizationForApp.data.team.environment.application.name}</strong
					> calculated from current utilization data.
				</BodyShort>

				<div class="cost-wrapper">
					<div class="cost-amount">
						{euroValueFormatter(
							round(
								yearlyOverageCost(
									UtilizationResourceType.CPU,
									(cpuReq ?? 0) - (utilization.cpu_series.at(-1)?.value ?? 0),
									$ResourceUtilizationForApp.data.currentUnitPrices.cpu.value,
									$ResourceUtilizationForApp.data.currentUnitPrices.memory.value
								),
								0
							),
							{ maximumFractionDigits: 0 }
						)}
					</div>
				</div>
			</div>
			<div class="card">
				<Heading level="2" size="medium" spacing
					><WalletFillIcon class="heading-aligned-icon" /> Cost of Unutilized Memory</Heading
				>
				<BodyShort spacing
					>Estimate of annual cost of unutilized memory for application <strong
						>{$ResourceUtilizationForApp.data.team.environment.application.name}</strong
					> calculated from current utilization data.</BodyShort
				>

				<div class="cost-wrapper">
					<div class="cost-amount">
						{euroValueFormatter(
							round(
								yearlyOverageCost(
									UtilizationResourceType.MEMORY,
									memReq - (utilization.memory_series.at(-1)?.value ?? 0),
									$ResourceUtilizationForApp.data.currentUnitPrices.cpu.value,
									$ResourceUtilizationForApp.data.currentUnitPrices.memory.value
								),
								0
							),
							{ maximumFractionDigits: 0 }
						)}
					</div>
				</div>
			</div>
		</div>
		{#if !isIn10PercentRange(cpuReq, cpuReqRecommendation) || cpuLimit || !isIn10PercentRange(memReq, memReqRecommendation) || !isIn10PercentRange(memLimit, memLimitRecommendation)}
			<Heading level="2" size="medium" spacing>Resource Settings and Recommendations</Heading>
			<BodyLong>
				<div>
					⚠️ Your app's resource settings are outside the recommended range. Consider adjusting them
					to optimize performance and cost.
				</div>
				<div>
					Read more about setting resources in the
					<a
						href={docURL(
							'/workloads/explanations/good-practices/?h=limit#set-reasonable-resource-requests-and-limits'
						)}>Nais documentation.</a
					>
				</div>
			</BodyLong>

			<Table size="small">
				<Thead>
					<Tr>
						<Th>Resource Type</Th>
						<Th>Current Value</Th>
						<Th>Recommended Value</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#if !isIn10PercentRange(cpuReq, cpuReqRecommendation)}
						<Tr>
							<Td>CPU Request</Td>
							<Td>{cpuReq ? formatKubernetesCPU(cpuReq) : 'Using default (200m)'}</Td>
							<Td>{formatKubernetesCPU(cpuReqRecommendation)}</Td>
						</Tr>
					{/if}
					{#if cpuLimit}
						<Tr>
							<Td>CPU Limit</Td>
							<Td>{formatKubernetesCPU(cpuLimit)}</Td>
							<Td>CPU Limit is generally not recommended</Td>
						</Tr>
					{/if}
					{#if !isIn10PercentRange(memReq, memReqRecommendation)}
						<Tr>
							<Td>Memory Request</Td>
							<Td>{memReq ? formatKubernetesMemory(memReq) : 'Using default (256Mi)'}</Td>
							<Td>{formatKubernetesMemory(memReqRecommendation)}</Td>
						</Tr>
					{/if}
					{#if !isIn10PercentRange(memLimit, memLimitRecommendation)}
						<Tr>
							<Td>Memory Limits</Td>
							<Td>{memLimit ? formatKubernetesMemory(memLimit) : 'Using default (512Mi)'}</Td>
							<Td>{formatKubernetesMemory(memLimitRecommendation)}</Td>
						</Tr>
					{/if}
				</Tbody>
			</Table>
			<ReadMore header="About Resource Recommendations">
				<div>
					<p>
						These recommendations are based on actual usage data from the past week, during working
						hours (weekdays, 06:00-18:00). They are intended to help right-size workloads to improve
						resource efficiency and reduce costs.
					</p>
					How recommendations are calculated:
					<dl>
						<dt><strong>CPU Request:</strong></dt>
						<dd>
							The highest average CPU usage during the timeframe. This helps ensure your app has
							enough CPU during peak usage, without over-allocating.
						</dd>
						<dt><strong>CPU Limit:</strong></dt>
						<dd>
							We do not recommend CPU limits, as the workload can utilize the shared resources.
						</dd>
						<dt><strong>Memory Request:</strong></dt>
						<dd>
							The 80th percentile of memory usage during the timeframe, then taking the maximum
							observed value. This aims to strike a balance between stability and efficient memory
							usage.
						</dd>
						<dt><strong>Memory Limit:</strong></dt>
						<dd>
							The 95th percentile of memory usage during the timeframe, using the maximum value seen
							across the week. This is meant to cap usage at a safe level without risking
							unnecessary OOM kills.
						</dd>
					</dl>
					Use these values as guidance when adjusting your resource settings. Properly tuned resource
					requests and limits help avoid both over-provisioning, wasting money and resources, and instability.
				</div>
			</ReadMore>
		{/if}

		<div class="section">
			<div class="heading-with-toggle">
				<Heading level="2" size="medium" spacing>Memory Usage</Heading>
				<ToggleGroup
					value={interval}
					onchange={(interval) => changeParams({ interval }, { noScroll: true })}
				>
					{#each ['1h', '6h', '1d', '7d', '30d'] as interval (interval)}
						<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
					{/each}
				</ToggleGroup>
			</div>

			<div class="chart-wrapper">
				<EChart
					options={options(
						utilization.memory_series.map((d) => {
							return {
								timestamp: d.timestamp,
								value: d.value / 1024 / 1024 / 1024,
								instance: d.instance
							};
						}),
						utilization.requested_memory_series.map((d) => {
							return {
								timestamp: d.timestamp,
								value: d.value / 1024 / 1024 / 1024
							};
						}),
						utilization.limit_memory_series.map((d) => {
							return {
								timestamp: d.timestamp,
								value: d.value / 1024 / 1024 / 1024
							};
						}),
						activityLog,
						(value) =>
							value == null
								? '-'
								: prettyBytes(value * 1024 ** 3, {
										locale: 'en',
										minimumFractionDigits: 0,
										maximumFractionDigits: 2,
										binary: true
									})
					)}
				/>
			</div>
			<ReadMore header="Analyzing Your Memory Usage">
				<BodyLong>
					This graph show your workloads's memory usage over time. <ul>
						<li>
							<strong>Requests</strong> (grey line): The minimum amount of memory guaranteed to your
							app.
						</li>
						<li>
							<strong>Limits</strong> (red line, if present): The maximum amount of memory your app can
							use.
						</li>
						<li>Shaded Areas: The actual memory usage of each running instance over time.</li>
					</ul>
					Your app can use more than its requested memory if available, but exceeding the memory
					<strong>limit</strong>
					will cause the instance to be terminated (<code>OOMKilled</code>).

					<div><strong>Optimize your memory settings:</strong></div>
					<div>
						✅ If memory usage is consistently below the request, consider lowering the request to
						reduce overall cost and resource waste.
					</div>
					<div>
						✅ Memory limits are useful for containing runaway memory usage, but setting them too
						low may cause instability.
					</div>
					<div>
						Read more about memory best practices in the <a
							href={docURL(
								'/workloads/explanations/good-practices/?h=limit#set-reasonable-resource-requests-and-limits'
							)}
						>
							Nais documentation.
						</a>
					</div>
				</BodyLong>
			</ReadMore>
		</div>
		<div class="section">
			<div class="heading-with-toggle">
				<Heading level="2" size="medium" spacing>CPU Usage</Heading>
				<ToggleGroup
					value={interval}
					onchange={(interval) => changeParams({ interval }, { noScroll: true })}
				>
					{#each ['1h', '6h', '1d', '7d', '30d'] as interval (interval)}
						<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
					{/each}
				</ToggleGroup>
			</div>
			<div class="chart-wrapper">
				<EChart
					options={options(
						utilization.cpu_series,
						utilization.requested_cpu_series,
						utilization.limit_cpu_series,
						activityLog,
						(value: number) =>
							value == null
								? '-'
								: `${value.toLocaleString('en-GB', { maximumFractionDigits: 4 })} CPUs`
					)}
				/>
			</div>
			<ReadMore header="Analyzing Your CPU Usage">
				<BodyLong>
					This graph show your workload's CPU usage over time. <ul>
						<li>
							<strong>Requests</strong> (grey line): The minimum amount of CPU guaranteed to your app.
						</li>
						<li>
							<strong>Limits</strong> (red line, if present): The maximum amount of CPU your app can
							use.
						</li>
						<li>Shaded Areas: The actual CPU usage of each running instance over time.</li>
					</ul>
					Your app can use more than its requested CPU if available, but exceeding the request might
					lead to
					<strong>CPU throttling</strong>, which can impact performance. However, this is usually
					not a problem for most applications, as Kubernetes is designed to handle resource
					contention gracefully. In many cases, workloads can burst beyond their requests when
					resources are available, ensuring smooth operation during short spikes in demand.
				</BodyLong>
				<Heading level="3" size="small" spacing>Optimize your CPU settings</Heading>
				<BodyLong>
					<div>
						✅ If CPU usage is consistently below the request, consider lowering the request to
						reduce costs and resource waste.
					</div>
					<div>
						✅ CPU throttling usually happens when a <strong>CPU limit</strong> is set. Not setting a
						limit allows the container to burst above its request, improving responsiveness during brief
						spikes.
					</div>
					<div>
						Read more about CPU best practices in the <a
							href={docURL(
								'/workloads/explanations/good-practices/?h=limit#set-reasonable-resource-requests-and-limits'
							)}
						>
							Nais documentation.
						</a>
					</div>
				</BodyLong>
			</ReadMore>
		</div>
	{:else}
		<div style="height: 380px; display: flex; justify-content: center; align-items: center;">
			<Loader size="3xlarge" />
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		gap: var(--ax-space-24);
	}
	.heading-with-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.section {
		display: grid;
	}

	.chart-wrapper {
		padding-block: 1rem;
	}

	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16) var(--ax-space-20);
		border-radius: 12px;
		align-items: stretch;
	}

	.cost-wrapper {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.cost-amount {
		background-color: var(--ax-bg-raised);
		font-size: 1.5rem;
		border-radius: 0.375rem;
		display: inline-block;
		align-items: center;
		padding: var(--ax-space-8) var(--ax-space-32);
	}

	.chart-wrapper :global(svg > g > path) {
		/* hack to fix the fill rule of annotation icons */
		fill-rule: evenodd;
	}
</style>
