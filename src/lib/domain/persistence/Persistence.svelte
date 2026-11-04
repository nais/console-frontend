<script lang="ts">
	import { ShBadge } from '#lib/shadcn/ui/index.js';
	import Icon from '#lib/ui/Icon.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { fragment, graphql, type Persistence } from '$houdini';

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
						id
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
					valkeys {
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
					... on Application {
						__typename
						postgreses {
							edges {
								cursor
								node {
									postgres {
										id
										name
									}
									branch {
										name
									}
								}
							}
						}
					}
					... on Job {
						__typename
						postgreses {
							edges {
								cursor
								node {
									postgres {
										id
										name
									}
									branch {
										name
									}
								}
							}
						}
					}
				}
			`)
		)
	);
	let fragmentData = $derived($data);

	const toIconLabel =
		(urlName: string, tooltip: string) =>
		(persistence: { node: { id: string; name: string } }) => ({
			id: persistence.node.id,
			label: persistence.node.name,
			href: `/team/${$data.team.slug}/${$data.teamEnvironment.environment.name}/${urlName}/${persistence.node.name}`,
			icon: urlName,
			tooltip,
			description: undefined as string | undefined
		});

	type KafkaNode = {
		id: string;
		label: string;
		href: string;
		icon: string;
		tooltip: string;
		description: string;
	};
	type PostgresUsage = {
		postgres: { id: string; name: string };
		branch: { name: string };
	};
	const postgresUsages = $derived.by(() => {
		const workloadData = fragmentData as Record<string, unknown>;
		if (workloadData.__typename !== 'Application' && workloadData.__typename !== 'Job') return [];
		const postgreses = workloadData.postgreses as {
			edges: { cursor: string; node: PostgresUsage }[];
		};
		return postgreses.edges;
	});
	const persistence = $derived({
		buckets: $data.buckets.edges.map(toIconLabel('bucket', 'Cloud Storage Bucket')),
		bigQuery: $data.bigQueryDatasets.edges.map(toIconLabel('bigquery', 'BigQuery Dataset')),
		cloudSql: $data.sqlInstances.edges.map(toIconLabel('cloudsql', 'Cloud SQL')),
		kafka: $data.kafkaTopicAcls.edges
			.filter((acl) => acl.node.teamName !== '*')
			.map((e) => e.node)
			.map((acl): KafkaNode => ({
				id: `${acl.topic.team.slug}/${acl.topic.teamEnvironment.environment.name}/${acl.topic.name}/${acl.workloadName}/${acl.access}`,
				label: acl.topic.name,
				href: `/team/${acl.topic.team.slug}/${acl.topic.teamEnvironment.environment.name}/kafka/${acl.topic.name}`,
				icon: 'kafka',
				tooltip: 'Kafka',
				description: acl.access
			}))
			.reduce((acc, acl) => {
				const existing = acc.find((a) => a.id === acl.id);
				if (!existing) {
					acc.push(acl);
				}
				return acc;
			}, [] as KafkaNode[]),
		openSearch: ($data.openSearch ? [$data.openSearch] : []).map((os) => ({
			id: os.id,
			label: os.name,
			href: `/team/${$data.team.slug}/${$data.teamEnvironment.environment.name}/opensearch/${os.name}`,
			icon: 'opensearch',
			tooltip: 'OpenSearch',
			description: os.access.edges.find((access) => access.node.workload.name == $data.name)?.node
				.access
		})),
		postgres: postgresUsages.map(({ cursor, node: usage }) => ({
			id: cursor,
			label: usage.postgres.name,
			href: `/team/${$data.team.slug}/${$data.teamEnvironment.environment.name}/postgres/${usage.postgres.name}`,
			icon: 'postgres',
			tooltip: 'Postgres',
			description: `Branch: ${usage.branch.name}`
		})),
		valkey: $data.valkeys.edges.map(toIconLabel('valkey', 'Valkey'))
	});
</script>

{#if Object.values(persistence).some((p) => p.length)}
	<SurfaceCard title="Persistence">
		<div class="content">
			{#each Object.entries(persistence) as [type, list] (type)}
				{#each list as item (item.id)}
					<a href={item.href} class="persistence-row" title="{item.tooltip}: {item.label}">
						<span class="persistence-icon">
							<Icon icon={item.icon} />
						</span>
						<span class="persistence-label">{item.label}</span>
						{#if item.description}
							<ShBadge variant="secondary" mono>{item.description}</ShBadge>
						{/if}
					</a>
				{/each}
			{/each}
		</div>
	</SurfaceCard>
{/if}

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.persistence-row {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.375rem 0.5rem;
		margin: 0 -0.5rem;
		border-radius: calc(var(--radius) - 3px);
		color: var(--foreground);
		text-decoration: none;
		font-size: 0.8125rem;
		transition: background-color 110ms ease;
	}

	.persistence-row:hover {
		background-color: var(--secondary);
		text-decoration: none;
	}

	.persistence-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
		font-size: 0.9375rem;
		flex-shrink: 0;
	}

	.persistence-label {
		flex: 1;
		min-width: 0;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
