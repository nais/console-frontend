<script lang="ts">
	import {
		graphql,
		paginatedFragment,
		type PersistenceActivityCardOpenSearchFragment,
		type PersistenceActivityCardValkeyFragment
	} from '$houdini';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import ActivityTimeline from './ActivityTimeline.svelte';

	interface ValkeyProps {
		resourceType: 'valkey';
		resource: PersistenceActivityCardValkeyFragment;
	}

	interface OpenSearchProps {
		resourceType: 'opensearch';
		resource: PersistenceActivityCardOpenSearchFragment;
	}

	type Props = ValkeyProps | OpenSearchProps;

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
								CREDENTIALS_CREATED
							]
						}
					) @paginate(mode: Infinite) {
						edges {
							node {
								id
								actor
								message
								createdAt
								resourceName
								resourceType
								environmentName
								teamSlug
								__typename
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
								CREDENTIALS_CREATED
							]
						}
					) @paginate(mode: Infinite) {
						edges {
							node {
								id
								actor
								message
								createdAt
								resourceName
								resourceType
								environmentName
								teamSlug
								__typename
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
		} else {
			await opensearchData.loadNextPage();
		}
		loadingMore = false;
	}

	const entries = $derived.by(() => {
		if (resourceType === 'valkey') {
			return ($valkeyData?.data?.activityLog.edges ?? []).map((e) => e.node);
		}
		return ($opensearchData?.data?.activityLog.edges ?? []).map((e) => e.node);
	});

	const hasNextPage = $derived.by(() => {
		if (resourceType === 'valkey') {
			return $valkeyData?.pageInfo.hasNextPage ?? false;
		}
		return $opensearchData?.pageInfo.hasNextPage ?? false;
	});
</script>

<SurfaceCard title="Activity">
	<ActivityTimeline {entries} {hasNextPage} loading={loadingMore} {loadMore} />
</SurfaceCard>
