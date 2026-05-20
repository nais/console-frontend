<script lang="ts">
	import {
		graphql,
		paginatedFragment,
		type ResourceActivityCardConfigFragment,
		type ResourceActivityCardSecretFragment
	} from '$houdini';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';

	import ActivityTimeline from './ActivityTimeline.svelte';
	import { sidebarTextComponent } from './sidebar/textComponent';

	interface SecretProps {
		resourceType: 'secret';
		resource: ResourceActivityCardSecretFragment;
	}

	interface ConfigProps {
		resourceType: 'config';
		resource: ResourceActivityCardConfigFragment;
	}

	type Props = SecretProps | ConfigProps;

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
								__typename
								id
								actor
								createdAt
								message
								resourceName
								resourceType
								environmentName
								teamSlug
								... on SecretCreatedActivityLogEntry {
									id
								}
								... on SecretDeletedActivityLogEntry {
									id
								}
								... on SecretValueAddedActivityLogEntry {
									secretValueAddedData: data {
										valueName
									}
								}
								... on SecretValueUpdatedActivityLogEntry {
									secretValueUpdatedData: data {
										valueName
									}
								}
								... on SecretValueRemovedActivityLogEntry {
									secretValueRemovedData: data {
										valueName
									}
								}
								... on SecretValuesViewedActivityLogEntry {
									secretValuesViewedData: data {
										reason
									}
								}
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
								__typename
								id
								actor
								createdAt
								message
								resourceName
								resourceType
								environmentName
								teamSlug
								... on ConfigCreatedActivityLogEntry {
									id
								}
								... on ConfigDeletedActivityLogEntry {
									id
								}
								... on ConfigUpdatedActivityLogEntry {
									configUpdatedData: data {
										updatedFields {
											field
											oldValue
											newValue
										}
									}
								}
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
		} else {
			await configData.loadNextPage();
		}
		loadingMore = false;
	}

	const entries = $derived.by(() => {
		if (resourceType === 'secret') {
			return ($secretData?.data?.activityLog.edges ?? []).map((e) => e.node);
		}
		return ($configData?.data?.activityLog.edges ?? []).map((e) => e.node);
	});

	const hasNextPage = $derived.by(() => {
		if (resourceType === 'secret') {
			return $secretData?.pageInfo.hasNextPage ?? false;
		}
		return $configData?.pageInfo.hasNextPage ?? false;
	});
</script>

<SurfaceCard title="Activity">
	<ActivityTimeline
		{entries}
		{hasNextPage}
		loading={loadingMore}
		{loadMore}
		textComponentFn={sidebarTextComponent}
	/>
</SurfaceCard>
