<script lang="ts">
	import { page } from '$app/state';
	import { graphql, type SearchQuery$input } from '$houdini';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import BigQueryIcon from '#lib/icons/BigQueryIcon.svelte';
	import KafkaIcon from '#lib/icons/KafkaIcon.svelte';
	import OpenSearchIcon from '#lib/icons/OpenSearchIcon.svelte';
	import ValkeyIcon from '#lib/icons/ValkeyIcon.svelte';
	import { favorites } from '#lib/stores/favorites.svelte.js';
	import { Modal } from '@nais/ds-svelte-community';
	import {
		BriefcaseClockIcon,
		BucketIcon,
		DatabaseIcon,
		MagnifyingGlassIcon,
		PackageIcon,
		PersonGroupIcon,
		StarFillIcon
	} from '@nais/ds-svelte-community/icons';
	import Search from './Search.svelte';

	let { open = $bindable() }: { open: boolean } = $props();

	const store = graphql(`
		query SearchQuery($query: String!, $types: [SearchType!], $teams: [Slug!]) {
			search(first: 20, filter: { query: $query, types: $types, teams: $teams }) {
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
			urlName: 'cloudsql',
			prefix: 'sql',
			type: 'SQL_INSTANCE'
		},
		PostgresInstance: {
			icon: DatabaseIcon,
			urlName: 'postgres',
			prefix: 'postgres',
			type: 'POSTGRES'
		},
		Valkey: {
			icon: ValkeyIcon,
			urlName: 'valkey',
			prefix: 'valkey',
			type: 'VALKEY'
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
	let teamFilter = $state<string | undefined>();
	let favoriteMode = $state(false);
	const favoriteResults = $derived.by(() => {
		if (!favoriteMode) {
			return [];
		}

		const searchValue = query.trim().toLowerCase();
		return favorites
			.getFavorites()
			.filter(Boolean)
			.filter((path) => {
				if (!searchValue) {
					return true;
				}

				return (
					favoriteLabel(path).toLowerCase().includes(searchValue) ||
					path.toLowerCase().includes(searchValue)
				);
			})
			.map((path) => ({
				icon: StarFillIcon,
				label: favoriteLabel(path),
				description: path,
				href: path,
				type: 'link' as const
			}));
	});

	function searchVariables(value: string): SearchQuery$input {
		const separator = value.indexOf(':');
		const prefix = separator >= 0 ? value.slice(0, separator) : undefined;
		const q = separator >= 0 ? value.slice(separator + 1) : undefined;
		const category = Object.values(categories).find((c) => c.prefix === prefix);
		const type = category?.type;
		const searchQuery = type ? q?.trim() || '' : value;
		const types: SearchQuery$input['types'] = type ? [type] : undefined;
		const teams: SearchQuery$input['teams'] =
			teamFilter && type !== 'TEAM' ? [teamFilter] : undefined;

		return { query: searchQuery, types, teams };
	}

	function resultBadge(href: string, teamSlug?: string) {
		if (href === page.url.pathname) {
			return 'CURRENT PAGE';
		}
		if (teamFilter) {
			return;
		}
		if (teamSlug && teamSlug === page.params.team) {
			return 'CURRENT TEAM';
		}
	}

	function capitalize(value: string) {
		return value ? value.at(0)!.toUpperCase() + value.slice(1) : '';
	}

	function favoritePageName(type: string) {
		switch (type) {
			case 'app':
				return 'Application';
			case 'job':
				return 'Job';
			case 'cloudsql':
				return 'Cloud SQL';
			case 'postgres':
				return 'Postgres';
			case 'bucket':
				return 'Bucket';
			case 'valkey':
				return 'Valkey';
			case 'opensearch':
				return 'OpenSearch';
			case 'kafka':
				return 'Kafka';
			case 'bigquery':
				return 'BigQuery';
			case 'deploy':
			case 'deploys':
				return 'Deployments';
			case 'activity-log':
				return 'Activity Log';
			case 'vulnerabilities':
				return 'Vulnerabilities';
			default:
				return capitalize(type);
		}
	}

	function favoriteLabel(path: string) {
		const parts = path.split('/').filter(Boolean);
		if (parts[0] !== 'team') {
			return path;
		}

		const team = parts[1];
		if (parts.length === 2) {
			return team;
		}

		if (parts.length === 3) {
			return `${team} · ${capitalize(parts[2])}`;
		}

		const env = parts[2];
		const type = favoritePageName(parts[3]);
		const resource = parts[4];
		const subpage = parts[5] ? favoritePageName(parts[5]) : undefined;
		return [team, env, type, resource, subpage].filter(Boolean).join(' · ');
	}

	function showFavorites() {
		favoriteMode = true;
		query = '';
		teamFilter = undefined;
	}

	function toggleFavorites() {
		if (favoriteMode) {
			favoriteMode = false;
			return;
		}

		showFavorites();
	}

	$effect(() => {
		if (favoriteMode) {
			return;
		}

		if (!query) {
			store.fetch({ variables: searchVariables(query) });
			return;
		}

		const timeout = setTimeout(() => {
			store.fetch({ variables: searchVariables(query) });
		}, 300);

		return () => clearTimeout(timeout);
	});
</script>

<Modal
	width="medium"
	bind:open
	class="search-modal"
	header={{ heading: 'Search', icon: MagnifyingGlassIcon }}
>
	<Search
		autofocus
		close={() => (open = false)}
		bind:query
		bind:teamFilter
		{favoriteMode}
		{showFavorites}
		{toggleFavorites}
		exitFavorites={() => (favoriteMode = false)}
		placeholder={favoriteMode ? 'Search favorites' : undefined}
		noResultsText={favoriteMode
			? query
				? `No favorites matching "${query}"`
				: 'No favorites yet'
			: undefined}
		loading={!favoriteMode && $store.fetching}
		results={favoriteMode
			? favoriteResults
			: $store.data?.search.nodes.map((result) => {
					const { icon, urlName } = categories[result.__typename];
					if (result.__typename === 'Team') {
						const href = `/team/${result.slug}`;
						return {
							icon,
							label: result.slug,
							description: result.purpose,
							badge: resultBadge(href, result.slug),
							teamSlug: result.slug,
							href,
							type: 'link'
						};
					}
					const href = `/team/${result.team.slug}/${result.teamEnvironment.environment.name}/${urlName}/${result.name}`;
					return {
						icon,
						label: result.name,
						description: result.team.slug,
						tag: {
							label: result.teamEnvironment.environment.name,
							variant: envTagVariant(result.teamEnvironment.environment.name)
						},
						badge: resultBadge(href, result.team.slug),
						href,
						type: 'link'
					};
				})}
	/>
</Modal>
