<script lang="ts">
	import {
		ActivityLogEntryResourceType,
		type ActivityLog$result,
		type ActivityLogEntryResourceType$options
	} from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	const {
		item,
		teamSlug
	}: {
		item: ActivityLog$result['team']['activityLog']['edges'][number]['node'];
		teamSlug: string;
	} = $props();

	const resourceLink = (
		environmentName: string,
		resourceType: ActivityLogEntryResourceType$options,
		resourceName: string
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
</script>

<div class="activity">
	<div>
		<BodyShort size="small" spacing>
			{#if item.__typename === 'SecretValueAddedActivityLogEntry'}
				{item.message}
				<strong>{item.secretValueAdded?.valueName}</strong> from
				{@const link = resourceLink(
					item.environmentName ? item.environmentName : '',
					item.resourceType,
					item.resourceName
				)}
				{#if link}
					<a href={link}>{item.resourceName}</a>
				{/if}
			{:else if item.__typename === 'SecretValueRemovedActivityLogEntry'}
				{item.message}
				<strong>{item.secretValueRemoved?.valueName}</strong> from
				{@const link = resourceLink(
					item.environmentName ? item.environmentName : '',
					item.resourceType,
					item.resourceName
				)}
				{#if link}
					<a href={link}>{item.resourceName}</a>
				{/if}
			{:else if item.__typename === 'SecretValueUpdatedActivityLogEntry'}
				{item.message}
				<strong>{item.secretValueUpdated?.valueName}</strong> from
				{@const link = resourceLink(
					item.environmentName ? item.environmentName : '',
					item.resourceType,
					item.resourceName
				)}
				{#if link}
					<a href={link}>{item.resourceName}</a>
				{/if}
			{:else if item.__typename === 'TeamEnvironmentUpdatedActivityLogEntry'}
				{item.message}
				{#if item.teamEnvironmentUpdated.updatedFields.length > 0}
					{#each item.teamEnvironmentUpdated.updatedFields as field (field)}
						{field.field}. Changed from {field.oldValue} to {field.newValue}.
					{/each}
				{/if}
			{:else if item.__typename === 'TeamMemberAddedActivityLogEntry'}
				{#if item.teamMemberAdded}
					Added member {item.teamMemberAdded.userEmail !== ''
						? item.teamMemberAdded.userEmail
						: 'unknown email'} to team as {item.teamMemberAdded.role}.
				{/if}
			{:else if item.__typename === 'TeamMemberRemovedActivityLogEntry'}
				{#if item.teamMemberRemoved}
					Removed {item.teamMemberRemoved.userEmail !== ''
						? item.teamMemberRemoved.userEmail
						: 'unknown email'}
					from team.
				{/if}
			{:else if item.__typename === 'TeamMemberSetRoleActivityLogEntry'}
				{#if item.teamMemberSetRole}
					Set role to {item.teamMemberSetRole.role} for {item.teamMemberSetRole.userEmail !== ''
						? item.teamMemberSetRole.userEmail
						: 'unknown email'}.
				{/if}
			{:else if item.__typename === 'TeamUpdatedActivityLogEntry'}
				{item.message}
				{#if item.teamUpdated?.updatedFields.length}
					{#each item.teamUpdated?.updatedFields as field (field)}
						{field.field}. Changed from {field.oldValue} to {field.newValue}.
					{/each}
				{/if}
			{:else if item.__typename === 'UnleashInstanceUpdatedActivityLogEntry'}
				{@const data = item.unleashInstanceUpdated}
				{item.message}
				{#if data?.allowedTeamSlug}
					Allowed <a href="/team/{data.allowedTeamSlug}">
						{data.allowedTeamSlug}
					</a> to access the instance.
				{:else if data?.revokedTeamSlug}
					Revoked access for <a href="/team/{data.revokedTeamSlug}">
						{data.revokedTeamSlug}
					</a> to the instance.
				{/if}
			{:else if item.__typename === 'RepositoryRemovedActivityLogEntry'}
				{item.actor} removed
				<a href="/team/{teamSlug}/repositories">repository</a>
				{item.resourceName} from team {item.teamSlug}.
			{:else if item.__typename === 'RepositoryAddedActivityLogEntry'}
				{item.actor} added
				<a href="/team/{teamSlug}/repositories">repository</a>
				{item.resourceName} to team {item.teamSlug}.
			{:else}
				{item.message}
				{@const link = resourceLink(
					item.environmentName ? item.environmentName : '',
					item.resourceType,
					item.resourceName
				)}
				{#if link}
					<a href={link}>{item.resourceName}</a>
				{/if}
			{/if}
			{#if item.environmentName}
				in {item.environmentName}
			{/if}
		</BodyShort>
	</div>
	<div>
		<BodyShort size="small" style="color: var(--a-text-subtle)">
			<Time time={item.createdAt} distance={true} />
			by {item.actor}
		</BodyShort>
	</div>
</div>

<style>
	.activity {
		display: flex;
		flex-direction: column;
	}
</style>
