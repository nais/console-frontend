<script lang="ts">
	import {
		graphql,
		paginatedFragment,
		type PersistenceActivityCardOpenSearchFragment,
		type PersistenceActivityCardPostgresFragment,
		type PersistenceActivityCardValkeyFragment
	} from '$houdini';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import ActivityTimeline from './ActivityTimeline.svelte';

	interface ValkeyProps {
		resourceType: 'valkey';
		resource: PersistenceActivityCardValkeyFragment;
	}

	interface OpenSearchProps {
		resourceType: 'opensearch';
		resource: PersistenceActivityCardOpenSearchFragment;
	}

	interface PostgresProps {
		resourceType: 'postgres';
		resource: PersistenceActivityCardPostgresFragment;
	}

	type Props = ValkeyProps | OpenSearchProps | PostgresProps;

	let { resourceType, resource }: Props = $props();

	const valkeyData = $derived(
		paginatedFragment(
			resourceType === 'valkey' ? (resource as PersistenceActivityCardValkeyFragment) : null,
			graphql(`
				fragment PersistenceActivityCardValkeyFragment on Valkey {
					activityLog(
						first: 5
						filter: {
							activityTypes: [
								VALKEY_CREATED
								VALKEY_UPDATED
								VALKEY_DELETED
								VALKEY_MAINTENANCE_STARTED
								VALKEY_CREDENTIALS_CREATED
							]
						}
					) @paginate(mode: Infinite) {
						edges {
							node {
								...ActivityLogEntryFragment
							}
						}
					}
				}
			`)
		)
	);

	const opensearchData = $derived(
		paginatedFragment(
			resourceType === 'opensearch'
				? (resource as PersistenceActivityCardOpenSearchFragment)
				: null,
			graphql(`
				fragment PersistenceActivityCardOpenSearchFragment on OpenSearch {
					activityLog(
						first: 5
						filter: {
							activityTypes: [
								OPENSEARCH_CREATED
								OPENSEARCH_UPDATED
								OPENSEARCH_DELETED
								OPENSEARCH_MAINTENANCE_STARTED
								OPENSEARCH_CREDENTIALS_CREATED
							]
						}
					) @paginate(mode: Infinite) {
						edges {
							node {
								...ActivityLogEntryFragment
							}
						}
					}
				}
			`)
		)
	);

	const postgresData = $derived(
		paginatedFragment(
			resourceType === 'postgres' ? (resource as PersistenceActivityCardPostgresFragment) : null,
			graphql(`
				fragment PersistenceActivityCardPostgresFragment on Postgres {
					activityLog(first: 5) @paginate(mode: Infinite) {
						edges {
							node {
								...ActivityLogEntryFragment
							}
						}
					}
				}
			`)
		)
	);

	let loadingMore = $state(false);

	async function loadMore() {
		loadingMore = true;
		if (resourceType === 'valkey') {
			await valkeyData.loadNextPage();
		} else if (resourceType === 'opensearch') {
			await opensearchData.loadNextPage();
		} else {
			await postgresData.loadNextPage();
		}
		loadingMore = false;
	}

	const entries = $derived.by(() => {
		if (resourceType === 'valkey') {
			return ($valkeyData?.data?.activityLog.edges ?? []).map((e) => e.node);
		}
		if (resourceType === 'opensearch') {
			return ($opensearchData?.data?.activityLog.edges ?? []).map((e) => e.node);
		}
		return ($postgresData?.data?.activityLog.edges ?? []).map((e) => e.node);
	});

	const hasNextPage = $derived.by(() => {
		if (resourceType === 'valkey') {
			return $valkeyData?.pageInfo.hasNextPage ?? false;
		}
		if (resourceType === 'opensearch') {
			return $opensearchData?.pageInfo.hasNextPage ?? false;
		}
		return $postgresData?.pageInfo.hasNextPage ?? false;
	});
</script>

<SurfaceCard title="Activity">
	<ActivityTimeline {entries} {hasNextPage} loading={loadingMore} {loadMore} />
</SurfaceCard>
