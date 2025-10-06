<script lang="ts">
	import { fragment, graphql, type ActivityLogEntryFragment } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import { activityIconClassFromEntry, icons } from '../activity/activity-log-icons';
	import '../activity/activity-log.css';
	import { activityLogResourceLink } from '../activity/utils';
	import ListItem from './ListItem.svelte';

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
					id
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
					... on ApplicationRestartedActivityLogEntry {
						__typename
					}
					... on ApplicationScaledActivityLogEntry {
						appScaled: data {
							newSize
							direction
						}
					}
					... on ClusterAuditActivityLogEntry {
						id
						clusterAuditData: data {
							action
							resourceKind
						}
					}
					... on DeploymentActivityLogEntry {
						deploymentData: data {
							triggerURL
						}
					}
					... on JobDeletedActivityLogEntry {
						__typename
					}
					... on JobTriggeredActivityLogEntry {
						__typename
					}
					... on OpenSearchCreatedActivityLogEntry {
						__typename
					}
					... on OpenSearchDeletedActivityLogEntry {
						__typename
					}
					... on OpenSearchUpdatedActivityLogEntry {
						__typename
					}
					... on RepositoryAddedActivityLogEntry {
						__typename
					}
					... on RepositoryRemovedActivityLogEntry {
						__typename
					}
					... on SecretCreatedActivityLogEntry {
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
					... on ServiceMaintenanceActivityLogEntry {
						__typename
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
					... on ValkeyCreatedActivityLogEntry {
						__typename
					}
					... on ValkeyDeletedActivityLogEntry {
						__typename
					}
					... on ValkeyUpdatedActivityLogEntry {
						__typename
					}
					... on VulnerabilityUpdatedActivityLogEntry {
						__typename
					}
				}
			`)
		)
	);

	const Icon = $derived(icons[$data.__typename] || RocketIcon);

	const properServiceName = (t: string) =>
		t === 'OPENSEARCH' ? 'OpenSearch' : t === 'VALKEY' ? 'Valkey' : 'service';

	// Svelte 5 runes
	const env = $derived($data.environmentName ?? '');
	const link = $derived(
		activityLogResourceLink(env, $data.resourceType, $data.resourceName, $data.teamSlug)
	);
	const isJob = $derived($data.resourceType === 'JOB');

	const secretValue = $derived(() => {
		switch ($data.__typename) {
			case 'SecretValueAddedActivityLogEntry':
				return { verb: 'Added value of', prep: 'to', name: $data.secretValueAdded?.valueName };
			case 'SecretValueRemovedActivityLogEntry':
				return {
					verb: 'Removed value of',
					prep: 'from',
					name: $data.secretValueRemoved?.valueName
				};
			case 'SecretValueUpdatedActivityLogEntry':
				return { verb: 'Updated value of', prep: 'in', name: $data.secretValueUpdated?.valueName };
			default:
				return null;
		}
	});
</script>

{#snippet ResourceName({ name, href }: { name: string; href?: string })}
	<strong
		>{#if href}<a {href}>{name}</a>{:else}{name}{/if}</strong
	>
{/snippet}

<ListItem>
	<div style="display: flex; gap: 0.5rem;">
		<div
			class={activityIconClassFromEntry(
				$data,
				$data.__typename === 'ClusterAuditActivityLogEntry'
					? $data.clusterAuditData?.action
					: undefined
			)}
		>
			<Icon size="1.25em" width="1.25em" height="1.25em" />
		</div>

		<div>
			<BodyShort size="small" spacing>
				{#if $data.__typename === 'ApplicationDeletedActivityLogEntry'}
					Application {@render ResourceName({ name: $data.resourceName })} was deleted
				{:else if $data.__typename === 'ApplicationRestartedActivityLogEntry'}
					Application {@render ResourceName({ name: $data.resourceName, href: link ?? undefined })} was
					restarted
				{:else if $data.__typename === 'ApplicationScaledActivityLogEntry'}
					Scaled {$data.appScaled.direction} application
					{@render ResourceName({ name: $data.resourceName, href: link ?? undefined })}
					to <strong>{$data.appScaled.newSize}</strong> replicas
				{:else if $data.__typename === 'ClusterAuditActivityLogEntry'}
					{capitalizeFirstLetter($data.message.toLowerCase())}
				{:else if $data.__typename === 'DeploymentActivityLogEntry'}
					{isJob ? 'Job' : 'Application'}
					{@render ResourceName({ name: $data.resourceName, href: link ?? undefined })} was deployed
				{:else if $data.__typename === 'JobDeletedActivityLogEntry'}
					Job {@render ResourceName({ name: $data.resourceName })} was deleted
				{:else if $data.__typename === 'JobTriggeredActivityLogEntry'}
					Job {@render ResourceName({ name: $data.resourceName, href: link ?? undefined })} was triggered
				{:else if $data.__typename === 'RepositoryRemovedActivityLogEntry'}
					<a href="/team/{$data.teamSlug}/repositories">Repository</a>
					<strong>{$data.resourceName}</strong> removed from team {$data.teamSlug}.
				{:else if $data.__typename === 'RepositoryAddedActivityLogEntry'}
					<a href="/team/{$data.teamSlug}/repositories">Repository</a>
					<strong>{$data.resourceName}</strong> added to team {$data.teamSlug}.
				{:else if $data.__typename === 'SecretCreatedActivityLogEntry'}
					Created secret
					{#if link}
						{@render ResourceName({ name: $data.resourceName, href: link })}
					{:else}
						{@render ResourceName({ name: $data.resourceName })}
					{/if}
				{:else if $data.__typename === 'SecretDeletedActivityLogEntry'}
					Deleted secret {@render ResourceName({ name: $data.resourceName })}
				{:else if secretValue() !== null}
					{secretValue()?.verb} <strong>{secretValue()?.name}</strong>
					{secretValue()?.prep} secret
					{#if link}
						{@render ResourceName({ name: $data.resourceName, href: link })}
					{:else}
						{@render ResourceName({ name: $data.resourceName })}
					{/if}
				{:else if $data.__typename === 'ServiceMaintenanceActivityLogEntry'}
					Started maintenance on {properServiceName($data.resourceType)}
					{#if link}
						{@render ResourceName({ name: $data.resourceName, href: link })}
					{:else}
						{@render ResourceName({ name: $data.resourceName })}
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
						Added member <strong>{$data.teamMemberAdded.userEmail || 'unknown email'}</strong>
						to team as <strong>{$data.teamMemberAdded.role}</strong>.
					{/if}
				{:else if $data.__typename === 'TeamMemberRemovedActivityLogEntry'}
					{#if $data.teamMemberRemoved}
						Removed <strong>{$data.teamMemberRemoved.userEmail || 'unknown email'}</strong>
						from team.
					{/if}
				{:else if $data.__typename === 'TeamMemberSetRoleActivityLogEntry'}
					{#if $data.teamMemberSetRole}
						Set role to <strong>{$data.teamMemberSetRole.role}</strong> for user
						{$data.teamMemberSetRole.userEmail || 'unknown email'}.
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
						Allowed <a href="/team/{u.allowedTeamSlug}">{u.allowedTeamSlug}</a> to access the instance.
					{:else if u.revokedTeamSlug}
						Revoked access for <a href="/team/{u.revokedTeamSlug}">{u.revokedTeamSlug}</a> to the instance.
					{/if}
				{:else}
					{$data.message}
					{#if link && !$data.message.startsWith('Deleted')}
						{@render ResourceName({ name: $data.resourceName, href: link })}
					{:else}
						{@render ResourceName({ name: $data.resourceName })}
					{/if}
				{/if}

				{#if $data.environmentName}
					in <Tag size="small" variant={envTagVariant($data.environmentName)}>
						{$data.environmentName}
					</Tag>.
				{/if}
			</BodyShort>

			<div>
				<BodyShort size="small" style="color: var(--ax-text-subtle)">
					<Time time={$data.createdAt} distance={true} />
					by {$data.actor}
				</BodyShort>
			</div>
		</div>
	</div>
</ListItem>
