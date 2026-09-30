<script lang="ts">
	import {
		graphql,
		paginatedFragment,
		type ResourceActivityCardConfigFragment,
		type ResourceActivityCardSecretFragment,
		type ResourceActivityCardServiceAccountFragment
	} from '$houdini';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import ActivityTimeline from './ActivityTimeline.svelte';

	interface SecretProps {
		resourceType: 'secret';
		resource: ResourceActivityCardSecretFragment;
	}

	interface ConfigProps {
		resourceType: 'config';
		resource: ResourceActivityCardConfigFragment;
	}

	interface ServiceAccountProps {
		resourceType: 'serviceAccount';
		resource: ResourceActivityCardServiceAccountFragment;
	}

	type Props = SecretProps | ConfigProps | ServiceAccountProps;

	let { resourceType, resource }: Props = $props();

	const secretData = $derived(
		paginatedFragment(
			resourceType === 'secret' ? (resource as ResourceActivityCardSecretFragment) : null,
			graphql(`
				fragment ResourceActivityCardSecretFragment on Secret {
					activityLog(
						first: 5
						filter: {
							activityTypes: [
								SECRET_UPDATED
								SECRET_CREATED
								SECRET_VALUE_ADDED
								SECRET_VALUE_UPDATED
								SECRET_VALUE_REMOVED
								SECRET_DELETED
								SECRET_VALUES_VIEWED
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

	const configData = $derived(
		paginatedFragment(
			resourceType === 'config' ? (resource as ResourceActivityCardConfigFragment) : null,
			graphql(`
				fragment ResourceActivityCardConfigFragment on Config {
					activityLog(
						first: 5
						filter: { activityTypes: [CONFIG_CREATED, CONFIG_UPDATED, CONFIG_DELETED] }
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

	const serviceAccountData = $derived(
		paginatedFragment(
			resourceType === 'serviceAccount'
				? (resource as ResourceActivityCardServiceAccountFragment)
				: null,
			graphql(`
				fragment ResourceActivityCardServiceAccountFragment on ServiceAccount {
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
		if (resourceType === 'secret') {
			await secretData.loadNextPage();
		} else if (resourceType === 'config') {
			await configData.loadNextPage();
		} else {
			await serviceAccountData.loadNextPage();
		}
		loadingMore = false;
	}

	const entries = $derived.by(() => {
		if (resourceType === 'secret') {
			return ($secretData?.data?.activityLog.edges ?? []).map((e) => e.node);
		}
		if (resourceType === 'config') {
			return ($configData?.data?.activityLog.edges ?? []).map((e) => e.node);
		}
		return ($serviceAccountData?.data?.activityLog.edges ?? []).map((e) => e.node);
	});

	const hasNextPage = $derived.by(() => {
		if (resourceType === 'secret') {
			return $secretData?.pageInfo.hasNextPage ?? false;
		}
		if (resourceType === 'config') {
			return $configData?.pageInfo.hasNextPage ?? false;
		}
		return $serviceAccountData?.pageInfo.hasNextPage ?? false;
	});
</script>

<SurfaceCard title="Activity">
	<ActivityTimeline {entries} {hasNextPage} loading={loadingMore} {loadMore} mode="sidebar" />
</SurfaceCard>
