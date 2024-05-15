<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import { Alert, HelpText } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import Card from '$lib/Card.svelte';
	import prettyBytes from 'pretty-bytes';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';

	export let data: PageData;
	$: ({ KafkaTopic } = data);
	$: topic = $KafkaTopic.data?.kafkaTopic;
	$: teamName = $page.params.team;
	$: envName = $page.params.env;

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $KafkaTopic.errors}
	{#each distinctErrors($KafkaTopic.errors) as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if topic && topic.id !== PendingValue}

	<div class="summary-grid">
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

					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>

				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization"
						>CPU utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">

						core(s)
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>

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
	</div>
		<Card columns={12}>
				<p>Kafka</p>
		</Card>




	{/if}
