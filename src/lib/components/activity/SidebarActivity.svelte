<script lang="ts">
	import {
		fragment,
		graphql,
		type SidebarActivityLogFragment,
		type SidebarActivityLogFragment$data
	} from '$houdini';
	import { Heading } from '@nais/ds-svelte-community';
	import {
		CaretUpDownIcon,
		LayerMinusIcon,
		LayersPlusIcon,
		MinusCircleIcon,
		NotePencilIcon,
		PersonPencilIcon,
		PlayIcon,
		PlusCircleIcon,
		RocketIcon
	} from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import ApplicationScaledActivityLogEntryText from './texts/ApplicationScaledActivityLogEntryText.svelte';
	import DefaultText from './texts/DefaultText.svelte';
	import DeploymentActivityLogEntryText from './texts/DeploymentActivityLogEntryText.svelte';
	import RepositoryAddedActivityLogEntryText from './texts/RepositoryAddedActivityLogEntryText.svelte';
	import RepositoryRemovedActivityLogEntryText from './texts/RepositoryRemovedActivityLogEntryText.svelte';
	import SecretCreatedActivityLogEntryText from './texts/SecretCreatedActivityLogEntryText.svelte';
	import SecretDeletedActivityLogEntry from './texts/SecretDeletedActivityLogEntry.svelte';
	import SecretValueAddedActivityLogEntryText from './texts/SecretValueAddedActivityLogEntryText.svelte';
	import SecretValueRemovedActivityLogEntryText from './texts/SecretValueRemovedActivityLogEntryText.svelte';
	import SecretValueUpdatedActivityLogEntryText from './texts/SecretValueUpdatedActivityLogEntryText.svelte';
	import TeamMemberAddedActivityLogEntryText from './texts/TeamMemberAddedActivityLogEntryText.svelte';
	import TeamMemberRemovedActivityLogEntryText from './texts/TeamMemberRemovedActivityLogEntryText.svelte';
	import TeamMemberSetRoleActivityLogEntryText from './texts/TeamMemberSetRoleActivityLogEntryText.svelte';

	interface Props {
		activityLog: SidebarActivityLogFragment;
		direct?: SidebarActivityLogFragment$data['activityLog'];
	}

	let { activityLog, direct }: Props = $props();

	let data = $derived(
		fragment(
			activityLog,
			graphql(`
				fragment SidebarActivityLogFragment on ActivityLogger
				@arguments(filter: { type: "ActivityLogFilter" }) {
					activityLog(first: 10, filter: $filter) {
						nodes {
							id
							actor
							message
							createdAt
							resourceName
							__typename
							... on DeploymentActivityLogEntry {
								deploymentData: data {
									triggerURL
								}
							}
							... on ApplicationScaledActivityLogEntry {
								appScaled: data {
									newSize
									direction
								}
							}
							... on RepositoryAddedActivityLogEntry {
								id
							}
							... on RepositoryRemovedActivityLogEntry {
								id
							}
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
								secretValueRemoved: data {
									valueName
								}
							}
							... on TeamMemberAddedActivityLogEntry {
								addedData: data {
									role
									userEmail
									userID
								}
							}
							... on TeamMemberRemovedActivityLogEntry {
								removedData: data {
									userEmail
									userID
								}
							}
							... on TeamMemberSetRoleActivityLogEntry {
								setRoleData: data {
									role
									userEmail
									userID
								}
							}
						}
					}
				}
			`)
		)
	);

	type Kind =
		| SidebarActivityLogFragment$data['activityLog']['nodes'][number]['__typename']
		| 'JobTriggeredActivityLogEntry';
	const icons: { [key in Kind]?: Component } = {
		DeploymentActivityLogEntry: RocketIcon,
		ApplicationScaledActivityLogEntry: CaretUpDownIcon,
		JobTriggeredActivityLogEntry: PlayIcon,
		RepositoryAddedActivityLogEntry: PlusCircleIcon,
		RepositoryRemovedActivityLogEntry: MinusCircleIcon,
		SecretValueAddedActivityLogEntry: LayersPlusIcon,
		SecretValueRemovedActivityLogEntry: LayerMinusIcon,
		SecretValueUpdatedActivityLogEntry: NotePencilIcon,
		SecretCreatedActivityLogEntry: PlusCircleIcon,
		SecretDeletedActivityLogEntry: MinusCircleIcon,
		TeamMemberAddedActivityLogEntry: PlusCircleIcon,
		TeamMemberRemovedActivityLogEntry: MinusCircleIcon,
		TeamMemberSetRoleActivityLogEntry: PersonPencilIcon
	};

	function textComponent(kind: Kind): Component<{ data: unknown }> {
		switch (kind) {
			case 'DeploymentActivityLogEntry':
				return DeploymentActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationScaledActivityLogEntry':
				return ApplicationScaledActivityLogEntryText as Component<{ data: unknown }>;
			case 'RepositoryAddedActivityLogEntry':
				return RepositoryAddedActivityLogEntryText as Component<{ data: unknown }>;
			case 'RepositoryRemovedActivityLogEntry':
				return RepositoryRemovedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretValueAddedActivityLogEntry':
				return SecretValueAddedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretValueUpdatedActivityLogEntry':
				return SecretValueUpdatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretValueRemovedActivityLogEntry':
				return SecretValueRemovedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretCreatedActivityLogEntry':
				return SecretCreatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretDeletedActivityLogEntry':
				return SecretDeletedActivityLogEntry as Component<{ data: unknown }>;
			case 'TeamMemberAddedActivityLogEntry':
				return TeamMemberAddedActivityLogEntryText as Component<{ data: unknown }>;
			case 'TeamMemberRemovedActivityLogEntry':
				return TeamMemberRemovedActivityLogEntryText as Component<{ data: unknown }>;
			case 'TeamMemberSetRoleActivityLogEntry':
				return TeamMemberSetRoleActivityLogEntryText as Component<{ data: unknown }>;
			default:
				return DefaultText as Component<{ data: unknown }>;
		}
	}

	const list = $derived(data && $data ? $data.activityLog.nodes : (direct?.nodes ?? []));
</script>

<div class="wrapper">
	<Heading level="3" size="small">Activity</Heading>
	{#each list as entry (entry.id)}
		{@const Icon = icons[entry.__typename] || RocketIcon}
		{@const TextComponent = textComponent(entry.__typename)}

		<div class="item">
			<div class="icon">
				<Icon width="75%" height="75%" />
			</div>
			<div class="content"><TextComponent data={entry} /></div>
		</div>
	{:else}
		<p>No activity log entries found.</p>
	{/each}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}
	.item {
		display: flex;
		position: relative;
		padding-bottom: 0.75rem;

		.icon {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 30px;
			height: 30px;
			min-width: 30px;
			min-height: 30px;
			background: var(--ax-bg-raised);
			z-index: 1;
			border-radius: 50%;
		}

		.content {
			flex: 1 1 auto;
			padding: 0 0 0 1rem;
		}

		&:not(:last-child)::before {
			background: var(--ax-border-neutral-subtleA);
			content: '';
			height: 100%;
			left: 14px;
			position: absolute;
			top: 20px;
			width: 2px;
			z-index: 0;
		}
	}
</style>
