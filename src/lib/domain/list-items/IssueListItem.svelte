<script lang="ts">
	import ApplicationRestartLoopIssue from '$lib/domain/issues/ApplicationRestartLoopIssue.svelte';
	import DefaultIssue from '$lib/domain/issues/DefaultIssue.svelte';
	import DeprecatedIngressIssue from '$lib/domain/issues/DeprecatedIngressIssue.svelte';
	import DeprecatedRegistryIssue from '$lib/domain/issues/DeprecatedRegistryIssue.svelte';
	import ExternalIngressCriticalVulnerabilityIssue from '$lib/domain/issues/ExternalIngressCriticalVulnerabilityIssue.svelte';
	import FailedSynchronizationIssue from '$lib/domain/issues/FailedSynchronizationIssue.svelte';
	import InvalidSpecIssue from '$lib/domain/issues/InvalidSpecIssue.svelte';
	import LastRunFailedIssue from '$lib/domain/issues/LastRunFailedIssue.svelte';
	import NoRunningInstancesIssue from '$lib/domain/issues/NoRunningInstancesIssue.svelte';
	import OpenSearchIssue from '$lib/domain/issues/OpenSearchIssue.svelte';
	import SqlInstanceStateIssue from '$lib/domain/issues/SqlInstanceStateIssue.svelte';
	import SqlInstanceVersionIssue from '$lib/domain/issues/SqlInstanceVersionIssue.svelte';
	import ValkeyIssue from '$lib/domain/issues/ValkeyIssue.svelte';
	import { IssueFragment } from '$lib/domain/list-items/issueListItem';
	import ListItem from '$lib/ui/ListItem.svelte';
	import { useFragment, type FragmentType } from '$lib/urql/fragment';
	import type { Component } from 'svelte';
	import MissingSbomIssue from '../issues/MissingSbomIssue.svelte';
	import VulnerableImageIssue from '../issues/VulnerableImageIssue.svelte';

	interface Props {
		item: FragmentType<typeof IssueFragment>;
	}

	let { item }: Props = $props();

	const data = $derived(useFragment(IssueFragment, item));

	function issueComponent(kind: string): Component<{ data: unknown }> {
		switch (kind) {
			case 'DeprecatedIngressIssue':
				return DeprecatedIngressIssue as Component<{ data: unknown }>;
			case 'DeprecatedRegistryIssue':
				return DeprecatedRegistryIssue as Component<{ data: unknown }>;
			case 'ExternalIngressCriticalVulnerabilityIssue':
				return ExternalIngressCriticalVulnerabilityIssue as Component<{ data: unknown }>;
			case 'LastRunFailedIssue':
				return LastRunFailedIssue as Component<{ data: unknown }>;
			case 'FailedSynchronizationIssue':
				return FailedSynchronizationIssue as Component<{ data: unknown }>;
			case 'InvalidSpecIssue':
				return InvalidSpecIssue as Component<{ data: unknown }>;
			case 'MissingSbomIssue':
				return MissingSbomIssue as Component<{ data: unknown }>;
			case 'VulnerableImageIssue':
				return VulnerableImageIssue as Component<{ data: unknown }>;
			case 'NoRunningInstancesIssue':
				return NoRunningInstancesIssue as Component<{ data: unknown }>;
			case 'ApplicationRestartLoopIssue':
				return ApplicationRestartLoopIssue as Component<{ data: unknown }>;
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
	{@const IssueComponent = issueComponent(data.__typename)}
	<IssueComponent {data} />
</ListItem>
