<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ KafkaTopic } = data);
	$: topic = $KafkaTopic.data?.team.kafkaTopic;
</script>

{#if $KafkaTopic.errors}
	{#each $KafkaTopic.errors as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else}
	<div class="grid">
		<Card columns={6}>
			<h3>Topic ACLs</h3>
			<Table size="small">
				<Thead>
					<Th>Team</Th>
					<Th>Consumer</Th>
					<Th>Access</Th>
				</Thead>
				<Tbody>
					{#if topic && topic.acl}
						{#each topic.acl as ac}
							<Tr>
								{#if ac.access === PendingValue}
									<Td><Skeleton variant="text" /></Td>
									<Td><Skeleton variant="text" /></Td>
									<Td><Skeleton variant="text" /></Td>
								{:else}
									<Td>
										<a href="/team/{ac.team}">{ac.team}</a>
									</Td>
									<Td>
										<a href="/team/{ac.team}/{String(topic.env.name)}/app/{ac.application}"
											>{ac.application}</a
										>
									</Td>
									<Td>{ac.access}</Td>
								{/if}
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
		<Card rows={2} columns={6}>
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
							{#if s.synchronizationState === 'NAIS'}
								<Nais style="color: var(--a-icon-success)" />
							{:else if s.synchronizationState === 'NOTNAIS'}
								<ExclamationmarkTriangleFillIcon
									style="color: var(--a-icon-warning)"
									title="Not NAIS!"
								/>
							{:else}
								Unknown
							{/if}
						</dd>
					{/if}

					{#if s.synchronizationTime && s.synchronizationTime !== PendingValue}
						<dt>Synchronization time</dt>
						<dd><Time time={s.synchronizationTime} /></dd>
					{/if}

					{#if s.credentialsExpiryTime && s.credentialsExpiryTime !== PendingValue}
						<dt>Credentials expiry time</dt>
						<dd><Time time={s.credentialsExpiryTime} /></dd>
					{/if}

					{#if s.latestAivenSyncFailure && s.latestAivenSyncFailure !== PendingValue}
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
		<Card columns={6}>
			<h3>Topic configuration</h3>
			{#if topic?.config}
				<dl>
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
		align-items: top;
		row-gap: 0.5em;
	}

	details {
		margin-bottom: 1em;
	}
</style>
