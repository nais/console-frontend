<script lang="ts">
	import { graphql } from '$houdini';
	import { logEvent } from '$lib/amplitude';
	import BigQueryIcon from '$lib/icons/BigQueryIcon.svelte';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import RedisIcon from '$lib/icons/RedisIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
	import { Modal } from '@nais/ds-svelte-community';
	import {
		BriefcaseClockIcon,
		BucketIcon,
		DatabaseIcon,
		PackageIcon,
		PersonGroupIcon
	} from '@nais/ds-svelte-community/icons';
	import Search from './Search.svelte';

	let { open = $bindable() }: { open: boolean } = $props();

	const store = graphql(`
		query SearchQuery($query: String!, $type: SearchType) {
			search(first: 20, filter: { query: $query, type: $type }) {
				nodes {
					__typename
					... on Team {
						slug
					}
					... on Application {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on Job {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on SqlInstance {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on RedisInstance {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on ValkeyInstance {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on OpenSearch {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on BigQueryDataset {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on Bucket {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on KafkaTopic {
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
	`);

	const categories = {
		Team: {
			icon: PersonGroupIcon,
			urlName: 'team',
			prefix: 'team',
			type: 'TEAM'
		},
		Application: {
			icon: PackageIcon,
			urlName: 'app',
			prefix: 'app',
			type: 'APPLICATION'
		},
		Job: {
			icon: BriefcaseClockIcon,
			urlName: 'job',
			prefix: 'job',
			type: 'JOB'
		},
		SqlInstance: {
			icon: DatabaseIcon,
			urlName: 'postgres',
			prefix: 'sql',
			type: 'SQL_INSTANCE'
		},
		RedisInstance: {
			icon: RedisIcon,
			urlName: 'redis',
			prefix: 'redis',
			type: 'REDIS_INSTANCE'
		},
		ValkeyInstance: {
			icon: ValkeyIcon,
			urlName: 'valkey',
			prefix: 'valkey',
			type: 'VALKEY_INSTANCE'
		},
		OpenSearch: {
			icon: OpenSearchIcon,
			urlName: 'opensearch',
			prefix: 'os',
			type: 'OPENSEARCH'
		},
		BigQueryDataset: {
			icon: BigQueryIcon,
			urlName: 'bigquery',
			prefix: 'bq',
			type: 'BIGQUERY_DATASET'
		},
		Bucket: {
			icon: BucketIcon,
			urlName: 'bucket',
			prefix: 'bucket',
			type: 'BUCKET'
		},
		KafkaTopic: {
			icon: KafkaIcon,
			urlName: 'kafka',
			prefix: 'kafka',
			type: 'KAFKA_TOPIC'
		}
	} as const;

	let query = $state('');

	$effect(() => {
		if (query) {
			const timeout = setTimeout(() => {
				const [prefix, q] = query.split(':');
				const category = Object.values(categories).find((c) => c.prefix === prefix);
				const type = q ? category?.type : undefined;
				store.fetch({ variables: { query: type ? q.trim() : query, type } });

				logEvent('search');
			}, 300);

			return () => clearTimeout(timeout);
		}
	});
</script>

<Modal width="medium" bind:open class="search-modal">
	<Search
		close={() => (open = false)}
		bind:query
		loading={$store.fetching}
		results={query
			? $store.data?.search.nodes.map((result) => {
					const { icon, urlName } = categories[result.__typename];

					if (result.__typename === 'Team') {
						return {
							icon,
							title: result.slug,
							href: `/team/${result.slug}`
						};
					}

					return {
						icon,
						title: result.name,
						description: `${result.team.slug} / ${result.environment.name}`,
						href: `/team/${result.team.slug}/${result.environment.name}/${urlName}/${result.name}`
					};
				})
			: undefined}
	/>
</Modal>

<style>
	:global(.search-modal) {
		height: 90%;
		max-height: 52rem;

		> :global(.navds-modal__header) {
			display: none;
		}

		> :global(.navds-modal__body) {
			padding: var(--a-spacing-6);
		}
	}
</style>
