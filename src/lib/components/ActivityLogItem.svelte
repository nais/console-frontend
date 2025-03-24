<script lang="ts">
	import {
		ActivityLogEntryResourceType,
		fragment,
		graphql,
		type ActivityLogEntryFragment,
		type ActivityLogEntryResourceType$options
	} from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	const resourceLink = (
		environmentName: string,
		resourceType: ActivityLogEntryResourceType$options,
		resourceName: string,
		teamSlug: string | null
	) => {
		switch (resourceType) {
			case ActivityLogEntryResourceType.APP:
				return `/team/${teamSlug}/${environmentName}/app/${resourceName}`;
			case ActivityLogEntryResourceType.JOB:
				return `/team/${teamSlug}/${environmentName}/job/${resourceName}`;
			case ActivityLogEntryResourceType.UNLEASH:
				return `/team/${teamSlug}/unleash`;
			case ActivityLogEntryResourceType.SECRET:
				return `/team/${teamSlug}/${environmentName}/secret/${resourceName}`;
			case ActivityLogEntryResourceType.TEAM:
				return `/team/${teamSlug}`;
			default:
				return null;
		}
	};

	interface Props {
		item: ActivityLogEntryFragment;
	}

	let { item }: Props = $props();

	let data = $derived(
		fragment(
			item,
			graphql(`
				fragment ActivityLogEntryFragment on ActivityLogEntry {
					__typename
					createdAt
					actor
					createdAt
					environmentName
					message
					resourceName
					resourceType
					teamSlug
					... on ApplicationDeletedActivityLogEntry {
						__typename
					}
					... on RepositoryAddedActivityLogEntry {
						__typename
					}
					... on RepositoryRemovedActivityLogEntry {
						__typename
					}
					... on SecretValueAddedActivityLogEntry {
						secretValueAdded: data {
							valueName
						}
					}
					... on SecretValueRemovedActivityLogEntry {
						secretValueRemoved: data {
							valueName
						}
					}
					... on SecretValueUpdatedActivityLogEntry {
						secretValueUpdated: data {
							valueName
						}
					}
					... on TeamEnvironmentUpdatedActivityLogEntry {
						teamEnvironmentUpdated: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on TeamMemberAddedActivityLogEntry {
						teamMemberAdded: data {
							role
							userEmail
						}
					}
					... on TeamMemberRemovedActivityLogEntry {
						teamMemberRemoved: data {
							userEmail
						}
					}
					... on TeamMemberSetRoleActivityLogEntry {
						teamMemberSetRole: data {
							role
							userEmail
						}
					}
					... on TeamUpdatedActivityLogEntry {
						teamUpdated: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on UnleashInstanceUpdatedActivityLogEntry {
						unleashInstanceUpdated: data {
							allowedTeamSlug
							revokedTeamSlug
						}
					}
				}
			`)
		)
	);
</script>

<div class="activity">
	<div>
		<BodyShort size="small" spacing>
			{#if $data.__typename === 'SecretValueAddedActivityLogEntry'}
				{$data.message}
				<strong>{$data.secretValueAdded?.valueName}</strong> from
				{@const link = resourceLink(
					$data.environmentName ? $data.environmentName : '',
					$data.resourceType,
					$data.resourceName,
					$data.teamSlug
				)}
				{#if link}
					<a href={link}>{$data.resourceName}</a>
				{/if}
			{:else if $data.__typename === 'SecretValueRemovedActivityLogEntry'}
				{$data.message}
				<strong>{$data.secretValueRemoved?.valueName}</strong> from
				{@const link = resourceLink(
					$data.environmentName ? $data.environmentName : '',
					$data.resourceType,
					$data.resourceName,
					$data.teamSlug
				)}
				{#if link}
					<a href={link}>{$data.resourceName}</a>
				{/if}
			{:else if $data.__typename === 'SecretValueUpdatedActivityLogEntry'}
				{$data.message}
				<strong>{$data.secretValueUpdated?.valueName}</strong> from
				{@const link = resourceLink(
					$data.environmentName ? $data.environmentName : '',
					$data.resourceType,
					$data.resourceName,
					$data.teamSlug
				)}
				{#if link}
					<a href={link}>{$data.resourceName}</a>
				{/if}
			{:else if $data.__typename === 'TeamEnvironmentUpdatedActivityLogEntry'}
				{$data.message}
				{#if $data.teamEnvironmentUpdated.updatedFields.length > 0}
					{#each $data.teamEnvironmentUpdated.updatedFields as field (field)}
						{field.field}. Changed from {field.oldValue} to {field.newValue}.
					{/each}
				{/if}
			{:else if $data.__typename === 'TeamMemberAddedActivityLogEntry'}
				{#if $data.teamMemberAdded}
					Added member {$data.teamMemberAdded.userEmail !== ''
						? $data.teamMemberAdded.userEmail
						: 'unknown email'} to team as {$data.teamMemberAdded.role}.
				{/if}
			{:else if $data.__typename === 'TeamMemberRemovedActivityLogEntry'}
				{#if $data.teamMemberRemoved}
					Removed {$data.teamMemberRemoved.userEmail !== ''
						? $data.teamMemberRemoved.userEmail
						: 'unknown email'}
					from team.
				{/if}
			{:else if $data.__typename === 'TeamMemberSetRoleActivityLogEntry'}
				{#if $data.teamMemberSetRole}
					Set role to {$data.teamMemberSetRole.role} for {$data.teamMemberSetRole.userEmail !== ''
						? $data.teamMemberSetRole.userEmail
						: 'unknown email'}.
				{/if}
			{:else if $data.__typename === 'TeamUpdatedActivityLogEntry'}
				{$data.message}
				{#if $data.teamUpdated?.updatedFields.length}
					{#each $data.teamUpdated?.updatedFields as field (field)}
						{field.field}. Changed from {field.oldValue} to {field.newValue}.
					{/each}
				{/if}
			{:else if $data.__typename === 'UnleashInstanceUpdatedActivityLogEntry'}
				{@const u = $data.unleashInstanceUpdated}
				{$data.message}
				{#if u.allowedTeamSlug}
					Allowed <a href="/team/{u.allowedTeamSlug}">
						{u.allowedTeamSlug}
					</a> to access the instance.
				{:else if u.revokedTeamSlug}
					Revoked access for <a href="/team/{u.revokedTeamSlug}">
						{u.revokedTeamSlug}
					</a> to the instance.
				{/if}
			{:else if $data.__typename === 'RepositoryRemovedActivityLogEntry'}
				{$data.actor} removed
				<a href="/team/{$data.teamSlug}/repositories">repository</a>
				{$data.resourceName} from team {$data.teamSlug}.
			{:else if $data.__typename === 'RepositoryAddedActivityLogEntry'}
				{$data.actor} added
				<a href="/team/{$data.teamSlug}/repositories">repository</a>
				{$data.resourceName} to team {$data.teamSlug}.
			{:else if $data.__typename === 'ApplicationDeletedActivityLogEntry'}
				Application <strong>{$data.resourceName}</strong> was deleted
			{:else}
				{$data.message}
				{@const link = resourceLink(
					$data.environmentName ? $data.environmentName : '',
					$data.resourceType,
					$data.resourceName,
					$data.teamSlug
				)}
				{#if link}
					<a href={link}>{$data.resourceName}</a>
				{/if}
			{/if}
			{#if $data.environmentName}
				in {$data.environmentName}.
			{/if}
		</BodyShort>
	</div>
	<div>
		<BodyShort size="small" style="color: var(--a-text-subtle)">
			<Time time={$data.createdAt} distance={true} />
			by {$data.actor}
		</BodyShort>
	</div>
</div>

<style>
	.activity {
		display: flex;
		flex-direction: column;
	}
</style>
