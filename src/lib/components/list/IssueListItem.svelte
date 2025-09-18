<script lang="ts">
	import { fragment, graphql, type IssueFragment, type IssueFragment$data } from '$houdini';
	import DefaultIssue from '$lib/components/issues/DefaultIssue.svelte';
	import DeprecatedIngressIssue from '$lib/components/issues/DeprecatedIngressIssue.svelte';
	import DeprecatedRegistryIssue from '$lib/components/issues/DeprecatedRegistryIssue.svelte';
	import FailedJobRunsIssue from '$lib/components/issues/FailedJobRunsIssue.svelte';
	import FailedSynchronizationIssue from '$lib/components/issues/FailedSynchronizationIssue.svelte';
	import InvalidSpecIssue from '$lib/components/issues/InvalidSpecIssue.svelte';
	import NoRunningInstancesIssue from '$lib/components/issues/NoRunningInstancesIssue.svelte';
	import OpenSearchIssue from '$lib/components/issues/OpenSearchIssue.svelte';
	import SqlInstanceStateIssue from '$lib/components/issues/SqlInstanceStateIssue.svelte';
	import SqlInstanceVersionIssue from '$lib/components/issues/SqlInstanceVersionIssue.svelte';
	import ValkeyIssue from '$lib/components/issues/ValkeyIssue.svelte';
	import type { Component } from 'svelte';
	import ListItem from './ListItem.svelte';

	interface Props {
		item: IssueFragment;
	}

	let { item }: Props = $props();

	let data = $derived(
		fragment(
			item,
			graphql(`
				fragment IssueFragment on Issue {
					teamEnvironment {
						environment {
							name
						}
						team {
							slug
						}
					}
					message
					severity

					... on DeprecatedIngressIssue {
						application {
							name
						}
						ingresses
					}
					... on DeprecatedRegistryIssue {
						workload {
							__typename
							name
							image {
								name
							}
						}
					}
					... on FailedJobRunsIssue {
						job {
							name
						}
					}
					... on FailedSynchronizationIssue {
						workload {
							__typename
							name
						}
					}
					... on InvalidSpecIssue {
						workload {
							__typename
							name
						}
					}
					... on MissingSbomIssue {
						workload {
							__typename
							name
						}
					}
					... on FailedSynchronizationIssue {
						workload {
							__typename
							name
						}
					}
					... on NoRunningInstancesIssue {
						workload {
							__typename
							name
						}
					}
					... on OpenSearchIssue {
						event
						openSearch {
							name
						}
					}
					... on SqlInstanceStateIssue {
						sqlInstance {
							name
						}
						state
					}
					... on SqlInstanceVersionIssue {
						sqlInstance {
							name
						}
					}
					... on ValkeyIssue {
						valkey {
							name
						}
					}
					... on VulnerableImageIssue {
						workload {
							__typename
							name
						}
					}
				}
			`)
		)
	);

	type Kind = IssueFragment$data['__typename'];

	function issueComponent(kind: Kind): Component<{ data: unknown }> {
		switch (kind) {
			case 'DeprecatedIngressIssue':
				return DeprecatedIngressIssue as Component<{ data: unknown }>;
			case 'DeprecatedRegistryIssue':
				return DeprecatedRegistryIssue as Component<{ data: unknown }>;
			case 'FailedJobRunsIssue':
				return FailedJobRunsIssue as Component<{ data: unknown }>;
			case 'FailedSynchronizationIssue':
				return FailedSynchronizationIssue as Component<{ data: unknown }>;
			case 'InvalidSpecIssue':
				return InvalidSpecIssue as Component<{ data: unknown }>;
			case 'MissingSbomIssue':
			case 'VulnerableImageIssue':
			case 'NoRunningInstancesIssue':
				return NoRunningInstancesIssue as Component<{ data: unknown }>;
			case 'OpenSearchIssue':
				return OpenSearchIssue as Component<{ data: unknown }>;
			case 'SqlInstanceStateIssue':
				return SqlInstanceStateIssue as Component<{ data: unknown }>;
			case 'SqlInstanceVersionIssue':
				return SqlInstanceVersionIssue as Component<{ data: unknown }>;
			case 'ValkeyIssue':
				return ValkeyIssue as Component<{ data: unknown }>;
			default:
				return DefaultIssue as Component<{ data: unknown }>;
		}
	}
</script>

<ListItem>
	{@const IssueComponent = issueComponent($data.__typename)}
	<IssueComponent data={$data} />
</ListItem>
