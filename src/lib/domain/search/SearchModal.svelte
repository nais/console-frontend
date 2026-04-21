<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import BigQueryIcon from '$lib/icons/BigQueryIcon.svelte';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { graphql as gql } from '$lib/urql/gql';
	import { SearchType } from '$lib/urql/gql/graphql';
	import { Modal } from '@nais/ds-svelte-community';
	import {
		BriefcaseClockIcon,
		BucketIcon,
		DatabaseIcon,
		PackageIcon,
		PersonGroupIcon
	} from '@nais/ds-svelte-community/icons';
	import { queryStore } from '@urql/svelte';
	import Search from './Search.svelte';

	let { open = $bindable() }: { open: boolean } = $props();

	const SearchModalQuery = gql(/* GraphQL */ `
		query SearchQuery($query: String!, $type: SearchType) {
			search(first: 20, filter: { query: $query, type: $type }) {
				nodes {
					__typename
					... on Team {
						slug
						purpose
					}
					... on Application {
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
					... on Job {
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
					... on SqlInstance {
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
					... on PostgresInstance {
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
					... on Valkey {
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
					... on OpenSearch {
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
					... on BigQueryDataset {
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
					... on Bucket {
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
					... on KafkaTopic {
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
	`);

	const categories = {
		Team: {
			icon: PersonGroupIcon,
			urlName: 'team',
			prefix: 'team',
			type: SearchType.TEAM
		},
		Application: {
			icon: PackageIcon,
			urlName: 'app',
			prefix: 'app',
			type: SearchType.APPLICATION
		},
		Job: {
			icon: BriefcaseClockIcon,
			urlName: 'job',
			prefix: 'job',
			type: SearchType.JOB
		},
		SqlInstance: {
			icon: DatabaseIcon,
			urlName: 'cloudsql',
			prefix: 'sql',
			type: SearchType.SQL_INSTANCE
		},
		PostgresInstance: {
			icon: DatabaseIcon,
			urlName: 'postgres',
			prefix: 'postgres',
			type: SearchType.POSTGRES
		},
		Valkey: {
			icon: ValkeyIcon,
			urlName: 'valkey',
			prefix: 'valkey',
			type: SearchType.VALKEY
		},
		OpenSearch: {
			icon: OpenSearchIcon,
			urlName: 'opensearch',
			prefix: 'os',
			type: SearchType.OPENSEARCH
		},
		BigQueryDataset: {
			icon: BigQueryIcon,
			urlName: 'bigquery',
			prefix: 'bq',
			type: SearchType.BIGQUERY_DATASET
		},
		Bucket: {
			icon: BucketIcon,
			urlName: 'bucket',
			prefix: 'bucket',
			type: SearchType.BUCKET
		},
		KafkaTopic: {
			icon: KafkaIcon,
			urlName: 'kafka',
			prefix: 'kafka',
			type: SearchType.KAFKA_TOPIC
		}
	} as const;

	let query = $state('');
	// Debounced + parsed search variables. `null` while the user is still
	// typing (or the box is empty) so the urql store stays paused.
	let searchVars = $state<{ query: string; type: SearchType | undefined } | null>(null);

	$effect(() => {
		if (!query) {
			searchVars = null;
			return;
		}

		const timeout = setTimeout(() => {
			const [prefix, q] = query.split(':');
			const category = Object.values(categories).find((c) => c.prefix === prefix);
			const type = category?.type;
			let searchQuery: string;
			if (type) {
				searchQuery = q && q.trim() ? q.trim() : '';
			} else {
				searchQuery = query;
			}
			searchVars = { query: searchQuery, type };
		}, 300);

		return () => clearTimeout(timeout);
	});

	const client = getContextClient();

	const store = $derived(
		queryStore({
			client,
			query: SearchModalQuery,
			variables: searchVars ?? { query: '', type: undefined },
			pause: searchVars === null,
			requestPolicy: 'cache-and-network'
		})
	);

	const result = $derived($store);
</script>

<Modal width="medium" bind:open class="search-modal">
	<Search
		close={() => (open = false)}
		bind:query
		loading={result.fetching}
		results={query
			? result.data?.search.nodes.map((node) => {
					const { icon, urlName } = categories[node.__typename];
					if (node.__typename === 'Team') {
						return {
							icon,
							label: node.slug,
							description: node.purpose,
							href: `/team/${node.slug}`,
							type: 'link'
						};
					}
					return {
						icon,
						label: node.name,
						description: node.team.slug,
						tag: {
							label: node.teamEnvironment.environment.name,
							variant: envTagVariant(node.teamEnvironment.environment.name)
						},
						href: `/team/${node.team.slug}/${node.teamEnvironment.environment.name}/${urlName}/${node.name}`,
						type: 'link'
					};
				})
			: undefined}
	/>
</Modal>
