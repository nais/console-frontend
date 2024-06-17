<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { PendingValue, State } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ KafkaTopic } = data);
	$: topic = $KafkaTopic.data?.team.kafkaTopic;
</script>

{#if $KafkaTopic.errors}
	<GraphErrors errors={$KafkaTopic.errors} />
{:else if topic && topic.id !== PendingValue}
	<div class="grid">
		<Card columns={7}>
			<h3 class="heading">
				<Kafka />
				{topic.name}
			</h3>

			<h3>Topic ACLs</h3>
			<Table size="small">
				<Thead>
					<Th>Team</Th>
					<Th>Consumer</Th>
					<Th>Access</Th>
				</Thead>
				<Tbody>
					{#if topic.acl}
						{#each topic.acl as ac}
							<Tr>
								<Td>
									<a href="/team/{ac.team}">{ac.team}</a>
								</Td>
								<Td>
									<a href="/team/{ac.team}/{topic.env.name}/app/{ac.application}"
										>{ac.application}</a
									>
								</Td>
								<Td>{ac.access}</Td>
							</Tr>
						{/each}
					{:else}
						<Tr>
							<Td colspan={999}><em>No ACLs found for the topic</em></Td>
						</Tr>
					{/if}
				</Tbody>
			</Table>
		</Card>
		<Card rows={2} columns={5}>
			<h3>Status</h3>

			{#if topic && topic.status}
				{@const s = topic.status}
				<dl class="status">
					{#if s.fullyQualifiedName}
						<dt>Fully qualified name</dt>
						<dd><code>{s.fullyQualifiedName}</code></dd>
					{/if}

					{#if s.synchronizationState}
						<dt>Synchronization state</dt>
						<dd>
							{#if s.synchronizationState === State.NAIS}
								<Nais style="color: var(&#45;&#45;a-icon-success)" />
							{:else if s.synchronizationState === State.NOTNAIS}
								<ExclamationmarkTriangleFillIcon
									style="color: var(&#45;&#45;a-icon-warning)"
									title="Not NAIS!"
								/>
							{:else}
								Unknown
							{/if}
						</dd>
					{/if}

					{#if s.synchronizationTime}
						<dt>Synchronization time</dt>
						<dd><Time time={s.synchronizationTime} /></dd>
					{/if}

					{#if s.credentialsExpiryTime}
						<dt>Credentials expiry time</dt>
						<dd><Time time={s.credentialsExpiryTime} /></dd>
					{/if}

					{#if s.latestAivenSyncFailure}
						<dt>Latest Aiven sync failure</dt>
						<dd><Time time={s.latestAivenSyncFailure} /></dd>
					{/if}
				</dl>

				{#if s.message}
					<details>
						<summary>Status message</summary>
						{s.message}
					</details>
				{/if}

				{#if s.errors}
					<h3>Errors</h3>
					<ul>
						{#each s.errors as err}
							<li>{err}</li>
						{/each}
					</ul>
				{/if}
			{:else}
				<p><em>Unable to find topic status</em></p>
			{/if}
		</Card>
		<Card columns={7}>
			<h3>Topic configuration</h3>
			{#if topic?.config}
				<dl class="status">
					{#each Object.entries(topic?.config) as [key, value]}
						<dt>{key}</dt>
						<dd>{value}</dd>
					{/each}
				</dl>
			{:else}
				<p><em>Unable to find topic configuration</em></p>
			{/if}</Card
		>
	</div>
{/if}

<style>
	.heading {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	dt {
		font-weight: bold;
	}

	dl.status {
		display: grid;
		grid-template-columns: 35% 65%;
		row-gap: 0.5em;
	}

	details {
		margin-bottom: 1em;
	}

</style>
