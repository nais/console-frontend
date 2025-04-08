<script lang="ts">
	import { fragment, graphql, type Persistence } from '$houdini';
	import { Heading } from '@nais/ds-svelte-community';
	import IconLabel from '../IconLabel.svelte';

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
					teamEnvironment {
						environment {
							name
						}
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
									teamEnvironment {
										environment {
											name
										}
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
		(urlName: string) => (persistence: { node: { id: string; name: string } }) => ({
			id: persistence.node.id,
			label: persistence.node.name,
			href: `/team/${$data.team.slug}/${$data.teamEnvironment.environment.name}/${urlName}/${persistence.node.name}`,
			icon: urlName
		});

	const persistence = $derived({
		buckets: $data.buckets.edges.map(toIconLabel('bucket')),
		bigQuery: $data.bigQueryDatasets.edges.map(toIconLabel('bigquery')),
		postgres: $data.sqlInstances.edges.map(toIconLabel('postgres')),
		kafka: $data.kafkaTopicAcls.edges
			.filter((acl) => acl.node.teamName !== '*')
			.map((e) => e.node)
			.map((acl) => ({
				id: acl,
				label: acl.topic.name,
				href: `/team/${acl.topic.team.slug}/${acl.topic.teamEnvironment.environment.name}/kafka/${acl.topic.name}`,
				icon: 'kafka',
				description: acl.access
			})),
		openSearch: ($data.openSearch ? [$data.openSearch] : []).map((os) => ({
			id: os,
			label: os.name,
			href: `/team/${$data.team.slug}/${$data.teamEnvironment.environment.name}/opensearch/${os.name}`,
			icon: 'opensearch',
			description: os.access.edges.find((access) => access.node.workload.name == $data.name)?.node
				.access
		})),
		valkey: $data.valkeyInstances.edges.map(toIconLabel('valkey'))
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
		gap: var(--ax-space-4, --a-spacing-1);
	}
</style>
