<script lang="ts">
	import { fragment, graphql, type Persistence } from '$houdini';
	import BigQuery from '$lib/icons/BigQueryIcon.svelte';
	import Kafka from '$lib/icons/KafkaIcon.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import Redis from '$lib/icons/RedisIcon.svelte';
	import Valkey from '$lib/icons/ValkeyIcon.svelte';
	import { Detail, Heading } from '@nais/ds-svelte-community';
	import { BucketIcon, DatabaseIcon } from '@nais/ds-svelte-community/icons';
	import IconWithText from './IconWithText.svelte';

	interface Props {
		workload: Persistence;
	}

	let { workload }: Props = $props();

	let data = $derived(
		fragment(
			workload,
			graphql(`
				fragment Persistence on Workload {
					name
					team {
						slug
					}
					environment {
						name
					}
					bigQueryDatasets {
						edges {
							node {
								name
							}
						}
					}
					buckets {
						edges {
							node {
								name
							}
						}
					}
					kafkaTopicAcls {
						edges {
							node {
								teamName
								access
								workloadName
								topic {
									name
									team {
										slug
									}
									environment {
										name
									}
								}
							}
						}
					}
					openSearch {
						name
						access {
							edges {
								node {
									access
									workload {
										name
									}
								}
							}
						}
					}
					redisInstances {
						edges {
							node {
								name
							}
						}
					}
					valkeyInstances {
						edges {
							node {
								name
							}
						}
					}
					sqlInstances {
						edges {
							node {
								name
							}
						}
					}
				}
			`)
		)
	);

	let persistenceCount = $state(0);
	if ($data.buckets.edges.length > 0) persistenceCount++;
	if ($data.bigQueryDatasets.edges.length > 0) persistenceCount++;
	if ($data.sqlInstances.edges.length > 0) persistenceCount++;
	if (
		$data.kafkaTopicAcls.edges.length > 0 &&
		$data.kafkaTopicAcls.edges.filter((acl) => acl.node.teamName !== '*').length > 0
	)
		persistenceCount++;
	if ($data.openSearch) persistenceCount++;
	if ($data.redisInstances.edges.length > 0) persistenceCount++;
	if ($data.valkeyInstances.edges.length > 0) persistenceCount++;
</script>

<Heading level="2" size="medium" spacing>Persistence</Heading>

{#if persistenceCount > 0}
	<div class="content">
		{#if $data.buckets.edges.length > 0}
			{#each $data.buckets.edges as bucket}
				<a href={`/team/${$data.team.slug}/${$data.environment.name}/bucket/${bucket.node.name}`}
					><IconWithText icon={BucketIcon} size="medium">
						{#snippet text()}
							<span class="workload-name">{bucket.node.name}</span>
						{/snippet}
					</IconWithText></a
				>
			{/each}
		{/if}
		{#if $data.bigQueryDatasets.edges.length > 0}
			{#each $data.bigQueryDatasets.edges as bq}
				<a href={`/team/${$data.team.slug}/${$data.environment.name}/bigquery/${bq.node.name}`}
					><IconWithText icon={BigQuery} size="medium">
						{#snippet text()}
							<span class="workload-name">{bq.node.name}</span>
						{/snippet}
					</IconWithText></a
				>
			{/each}
		{/if}
		{#if $data.sqlInstances.edges.length > 0}
			{#each $data.sqlInstances.edges as sql}
				<a href={`/team/${$data.team.slug}/${$data.environment.name}/postgres/${sql.node.name}`}
					><IconWithText icon={DatabaseIcon} size="medium">
						{#snippet text()}
							<span class="workload-name">{sql.node.name}</span>
						{/snippet}
					</IconWithText></a
				>
			{/each}
		{/if}
		{#if $data.kafkaTopicAcls.edges.length > 0}
			{#each $data.kafkaTopicAcls.edges as acl}
				{#if acl.node.teamName !== '*'}
					<a
						href={`/team/${acl.node.topic.team.slug}/${acl.node.topic.environment.name === 'prod-fss' ? 'prod-gcp' : acl.node.topic.environment.name === 'dev-fss' ? 'dev-gcp' : acl.node.topic.environment.name}/kafka/${acl.node.topic.name}`}
					>
						<IconWithText icon={Kafka} size="medium" description={acl.node.access}>
							{#snippet text()}
								<span class="workload-name">{acl.node.topic.name}</span>
							{/snippet}
						</IconWithText>
					</a>
				{/if}
			{/each}
		{/if}
		{#if $data.openSearch}
			<a
				href={`/team/${$data.team.slug}/${$data.environment.name}/opensearch/${$data.openSearch.name}`}
			>
				<IconWithText icon={OpenSearchIcon} size="medium">
					{#snippet text()}
						<span class="workload-name">{$data.openSearch?.name}</span>
					{/snippet}

					{#snippet description()}
						{#if $data.openSearch?.access.edges}
							{#each $data.openSearch?.access.edges as access}
								{#if access.node.workload.name == $data.name}
									<Detail style="font-weight: normal; color: var(--a-text-subtle);"
										>{access.node.access}</Detail
									>
								{/if}
							{/each}
						{/if}
					{/snippet}
				</IconWithText>
			</a>
		{/if}

		{#if $data.redisInstances.edges.length > 0}
			{#each $data.redisInstances.edges as redis}
				<a href={`/team/${$data.team.slug}/${$data.environment.name}/redis/${redis.node.name}`}
					><IconWithText icon={Redis} size="medium">
						{#snippet text()}
							<span class="workload-name">{redis.node.name}</span>
						{/snippet}
					</IconWithText></a
				>
			{/each}
		{/if}

		{#if $data.valkeyInstances.edges.length > 0}
			{#each $data.valkeyInstances.edges as valkey}
				<a href={`/team/${$data.team.slug}/${$data.environment.name}/valkey/${valkey.node.name}`}
					><IconWithText icon={Valkey} size="medium">
						{#snippet text()}
							<span class="workload-name">{valkey.node.name}</span>
						{/snippet}
					</IconWithText></a
				>
			{/each}
		{/if}
	</div>
{:else}
	No persistence configured for this app.
{/if}

<style>
	a {
		font-weight: var(--a-font-weight-bold);
		&:not(:active) {
			color: var(--a-text-defualt);
		}
		text-decoration: none;
		&:hover .workload-name {
			text-decoration: underline;
		}
	}
	.content {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--a-spacing-1);
	}
</style>
