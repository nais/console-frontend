<script lang="ts">
	import { fragment, graphql, type Persistence } from '$houdini';
	import BigQuery from '$lib/icons/BigQueryIcon.svelte';
	import Kafka from '$lib/icons/KafkaIcon.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import Redis from '$lib/icons/RedisIcon.svelte';
	import Valkey from '$lib/icons/ValkeyIcon.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import { BucketIcon, DatabaseIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import IconLabel from './IconLabel.svelte';

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
								id
								name
							}
						}
					}
					buckets {
						edges {
							node {
								id
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
										id
										name
									}
								}
							}
						}
					}
					redisInstances {
						edges {
							node {
								id
								name
							}
						}
					}
					valkeyInstances {
						edges {
							node {
								id
								name
							}
						}
					}
					sqlInstances {
						edges {
							node {
								id
								name
							}
						}
					}
				}
			`)
		)
	);

	const toIconLabel =
		(urlName: string, icon: Component) =>
		(persistence: { node: { id: string; name: string } }) => ({
			id: persistence.node.id,
			label: persistence.node.name,
			href: `/team/${$data.team.slug}/${$data.environment.name}/${urlName}/${persistence.node.name}`,
			icon
		});

	const persistence = $derived({
		buckets: $data.buckets.edges.map(toIconLabel('bucket', BucketIcon)),
		bigQuery: $data.bigQueryDatasets.edges.map(toIconLabel('bigquery', BigQuery)),
		postgres: $data.sqlInstances.edges.map(toIconLabel('postgres', DatabaseIcon)),
		kafka: $data.kafkaTopicAcls.edges
			.filter((acl) => acl.node.teamName !== '*')
			.map((e) => e.node)
			.map((acl) => ({
				id: acl,
				label: acl.topic.name,
				href: `/team/${acl.topic.team.slug}/${acl.topic.environment.name}/kafka/${acl.topic.name}`,
				icon: Kafka,
				description: acl.access
			})),
		openSearch: ($data.openSearch ? [$data.openSearch] : []).map((os) => ({
			id: os,
			label: os.name,
			href: `/team/${$data.team.slug}/${$data.environment.name}/opensearch/${os.name}`,
			icon: OpenSearchIcon,
			description: os.access.edges.find((access) => access.node.workload.name == $data.name)?.node
				.access
		})),
		redis: $data.redisInstances.edges.map(toIconLabel('redis', Redis)),
		valkey: $data.valkeyInstances.edges.map(toIconLabel('valkey', Valkey))
	});
</script>

<Heading level="2" size="medium" spacing>Persistence</Heading>

{#if Object.values(persistence).some((p) => p.length)}
	<div class="content">
		{#each Object.entries(persistence) as [type, list] (type)}
			{#each list as persistence (persistence.id)}
				<IconLabel {...persistence} />
			{/each}
		{/each}
	</div>
{:else}
	No persistence configured for this app.
{/if}

<style>
	.content {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--a-spacing-1);
	}
</style>
