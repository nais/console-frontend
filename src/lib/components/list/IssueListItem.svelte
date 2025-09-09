<script lang="ts">
	import { fragment, graphql, type IssueFragment, type IssueFragment$data } from '$houdini';
	import type { Component } from 'svelte';
	import DefaultIssue from '../issues/DefaultIssue.svelte';
	import DeprecatedIngressIssue from '../issues/DeprecatedIngressIssue.svelte';
	import DeprecatedRegistryIssue from '../issues/DeprecatedRegistryIssue.svelte';
	import OpenSearchIssue from '../issues/OpenSearchIssue.svelte';
	import SqlInstanceStateIssue from '../issues/SqlInstanceStateIssue.svelte';
	import SqlInstanceVersionIssue from '../issues/SqlInstanceVersionIssue.svelte';
	import ValkeyIssue from '../issues/ValkeyIssue.svelte';
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
