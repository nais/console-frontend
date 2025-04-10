<script lang="ts">
	import {
		ActivityLogEntryResourceType,
		fragment,
		graphql,
		type ActivityLogEntryFragment,
		type ActivityLogEntryResourceType$options
	} from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

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
					... on ApplicationRestartedActivityLogEntry {
						__typename
					}
					... on ApplicationDeletedActivityLogEntry {
						__typename
					}
					... on RepositoryAddedActivityLogEntry {
						__typename
					}
					... on RepositoryRemovedActivityLogEntry {
						__typename
					}
					... on SecretDeletedActivityLogEntry {
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
					... on JobTriggeredActivityLogEntry {
						__typename
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
				Added value of
				<strong>{$data.secretValueAdded?.valueName}</strong> to secret {@const link = resourceLink(
					$data.environmentName ? $data.environmentName : '',
					$data.resourceType,
					$data.resourceName,
					$data.teamSlug
				)}
				{#if link}
					<a href={link}>{$data.resourceName}</a>
				{/if}
			{:else if $data.__typename === 'SecretValueRemovedActivityLogEntry'}
				Removed value of
				<strong>{$data.secretValueRemoved?.valueName}</strong> from secret
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
				Updated value of
				<strong>{$data.secretValueUpdated?.valueName}</strong> in secret {@const link =
					resourceLink(
						$data.environmentName ? $data.environmentName : '',
						$data.resourceType,
						$data.resourceName,
						$data.teamSlug
					)}
				{#if link}
					<a href={link}>{$data.resourceName}</a>
				{/if}
			{:else if $data.__typename === 'SecretDeletedActivityLogEntry'}
				{$data.message}
				<strong>{$data.resourceName}</strong>
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
					Removed <strong
						>{$data.teamMemberRemoved.userEmail !== ''
							? $data.teamMemberRemoved.userEmail
							: 'unknown email'}</strong
					>
					from team.
				{/if}
			{:else if $data.__typename === 'TeamMemberSetRoleActivityLogEntry'}
				{#if $data.teamMemberSetRole}
					Set role to <strong>{$data.teamMemberSetRole.role}</strong> for user {$data
						.teamMemberSetRole.userEmail !== ''
						? $data.teamMemberSetRole.userEmail
						: 'unknown email'}.
				{/if}
			{:else if $data.__typename === 'TeamUpdatedActivityLogEntry'}
				{$data.message}
				{#if $data.teamUpdated?.updatedFields.length}
					{#each $data.teamUpdated?.updatedFields as field (field)}
						{field.field}. Changed from <i>{field.oldValue}</i> to <i>{field.newValue}</i>.
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
				<a href="/team/{$data.teamSlug}/repositories">Repository</a>
				<strong>{$data.resourceName}</strong> removed from team {$data.teamSlug}.
			{:else if $data.__typename === 'RepositoryAddedActivityLogEntry'}
				<a href="/team/{$data.teamSlug}/repositories">Repository</a>
				<strong>{$data.resourceName}</strong> added to team {$data.teamSlug}.
			{:else if $data.__typename === 'ApplicationDeletedActivityLogEntry'}
				Application <strong>{$data.resourceName}</strong> was deleted
			{:else if $data.__typename === 'ApplicationRestartedActivityLogEntry'}
				Application <strong>{$data.resourceName}</strong> was restarted
			{:else if $data.__typename === 'JobTriggeredActivityLogEntry'}
				Job <a
					href={resourceLink(
						$data.environmentName ? $data.environmentName : '',
						$data.resourceType,
						$data.resourceName,
						$data.teamSlug
					)}>{$data.resourceName}</a
				>
				was triggered
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
				in <Tag size="small" variant={envTagVariant($data.environmentName)}>
					{$data.environmentName}
				</Tag>.
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
