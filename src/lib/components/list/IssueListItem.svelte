<script lang="ts">
	import { fragment, graphql, type IssueFragment, type IssueFragment$data } from '$houdini';
	import type { Component } from 'svelte';
	import DefaultIssue from '../issues/DefaultIssue.svelte';
	import DeprecatedIngressIssue from '../issues/DeprecatedIngressIssue.svelte';
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
					environment
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
							name
							__typename
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
			default:
				return DefaultIssue as Component<{ data: unknown }>;
		}
	}
</script>

<ListItem>
	{@const IssueComponent = issueComponent($data.__typename)}
	<IssueComponent data={$data} />
</ListItem>
