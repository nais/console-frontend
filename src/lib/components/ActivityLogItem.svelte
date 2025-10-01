<script lang="ts">
	import {
		ActivityLogEntryResourceType,
		fragment,
		graphql,
		type ActivityLogEntryFragment,
		type ActivityLogEntryResourceType$options
	} from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
	import Time from '$lib/Time.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
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
			case ActivityLogEntryResourceType.OPENSEARCH:
				return `/team/${teamSlug}/${environmentName}/opensearch/${resourceName}`;
			case ActivityLogEntryResourceType.REPOSITORY:
				return `/team/${teamSlug}/repositories`;
			case ActivityLogEntryResourceType.VALKEY:
				return `/team/${teamSlug}/${environmentName}/valkey/${resourceName}`;
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
					id
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
					... on ServiceMaintenanceActivityLogEntry {
						__typename
					}
					... on ClusterAuditActivityLogEntry {
						id
						clusterAuditData: data {
							action
							resourceKind
						}
					}
				}
			`)
		)
	);

	const icons: { [key: string]: Component } = {
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
		TeamMemberSetRoleActivityLogEntry: PersonPencilIcon,
		ClusterAuditActivityLogEntry: NotePencilIcon,
		ValkeyCreatedActivityLogEntry: ValkeyIcon,
		ValkeyDeletedActivityLogEntry: ValkeyIcon,
		ValkeyUpdatedActivityLogEntry: ValkeyIcon,
		OpenSearchCreatedActivityLogEntry: OpenSearchIcon,
		OpenSearchDeletedActivityLogEntry: OpenSearchIcon,
		OpenSearchUpdatedActivityLogEntry: OpenSearchIcon
	};

	const iconVariant = (typename: string, direction?: string, auditAction?: string): string => {
		if (typename.includes('ApplicationScaled')) {
			if (direction === 'UP') return 'scale-up';
			if (direction === 'DOWN') return 'scale-down';
			return 'scale-neutral';
		}

		// Cluster audit: hvis action finnes, farg som added/updated/deleted; ellers audit
		if (typename.includes('ClusterAudit')) {
			if (auditAction) {
				const a = auditAction.toLowerCase();
				if (a.includes('create') || a === 'apply') return 'added';
				if (a.includes('delete')) return 'deleted';
				if (a.includes('update') || a.includes('patch') || a.includes('replace')) return 'updated';
			}
			return 'audit';
		}

		if (typename.includes('Added') || typename.includes('Created')) return 'added';
		if (typename.includes('Removed') || typename.includes('Deleted')) return 'deleted';
		if (typename.includes('Updated') || typename.includes('SetRole')) return 'updated';
		if (typename.includes('Deployment') || typename.includes('Restarted')) return 'deployment';
		if (typename.includes('Maintenance')) return 'maintenance';
		return 'neutral';
	};
</script>

<div class="activity">
	<div
		class="icon {iconVariant(
			$data.__typename,
			$data.__typename === 'ApplicationScaledActivityLogEntry'
				? $data.appScaled?.direction
				: undefined
		)}"
	>
		{#if $data.__typename}
			{@const Icon = icons[$data.__typename] || RocketIcon}
			<Icon />
		{/if}
	</div>
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
			{:else if $data.__typename === 'DeploymentActivityLogEntry'}
				{$data.resourceType === 'JOB' ? 'Job' : 'Application'}
				<a
					href={resourceLink(
						$data.environmentName ? $data.environmentName : '',
						$data.resourceType,
						$data.resourceName,
						$data.teamSlug
					)}>{$data.resourceName}</a
				> was deployed
			{:else if $data.__typename === 'ApplicationScaledActivityLogEntry'}
				Scaled {$data.appScaled.direction} application
				<a
					href={resourceLink(
						$data.environmentName ? $data.environmentName : '',
						$data.resourceType,
						$data.resourceName,
						$data.teamSlug
					)}>{$data.resourceName}</a
				>
				to <strong>{$data.appScaled.newSize}</strong> replicas
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
			{:else if $data.__typename === 'ServiceMaintenanceActivityLogEntry'}
				Started maintenance on {$data.resourceType === 'OPENSEARCH'
					? 'OpenSearch'
					: $data.resourceType === 'VALKEY'
						? 'Valkey'
						: 'service'}
				<a
					href={resourceLink(
						$data.environmentName ? $data.environmentName : '',
						$data.resourceType,
						$data.resourceName,
						$data.teamSlug
					)}>{$data.resourceName}</a
				>
			{:else if $data.__typename === 'ClusterAuditActivityLogEntry'}
				{capitalizeFirstLetter($data.message.toLowerCase())} in
				<a
					href={resourceLink(
						$data.environmentName ? $data.environmentName : '',
						$data.resourceType,
						$data.resourceName,
						$data.teamSlug
					)}>{$data.resourceName}</a
				>
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
		<div>
			<BodyShort size="small" style="color: var(--ax-text-subtle)">
				<Time time={$data.createdAt} distance={true} />
				by {$data.actor}
			</BodyShort>
		</div>
	</div>
</div>

<style>
	.activity {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: var(--ax-space-12); /* mer luft mellom ikon og tekst */
		padding: var(--ax-space-2) 0;
	}

	.icon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 36px;
		height: 36px;
		min-width: 36px;
		min-height: 36px;

		border-radius: 50%;
		border: 1px solid var(--ax-border-neutral-subtle);
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.05),
			0 2px 6px rgba(0, 0, 0, 0.08);

		color: white;
		font-size: 18px;
		transition: all 0.15s ease-in-out;
	}

	.icon:hover {
		transform: scale(1.05);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.08),
			0 4px 10px rgba(0, 0, 0, 0.12);
	}

	/* Scale */
	.icon.scale-up {
		background: linear-gradient(145deg, #27ae60, #1e874b); /* grønn */
	}
	.icon.scale-down {
		background: linear-gradient(145deg, #e74c3c, #c0392b); /* rød */
	}
	.icon.scale-neutral {
		background: linear-gradient(145deg, #95a5a6, #7f8c8d); /* grå */
	}

	/* Andre varianter (fra før) */
	.icon.added {
		background: linear-gradient(145deg, #3bb273, #2d995f);
	}
	.icon.deleted {
		background: linear-gradient(145deg, #e15241, #c0392b);
	}
	.icon.updated {
		background: linear-gradient(145deg, #3498db, #2c80b4);
	}
	.icon.deployment {
		background: linear-gradient(145deg, #8e44ad, #6d3390);
	}
	.icon.maintenance {
		background: linear-gradient(145deg, #e67e22, #ca6b16);
	}
	.icon.neutral {
		background: linear-gradient(145deg, var(--ax-bg-default), var(--ax-bg-raised));
		color: var(--ax-text-neutral-strong);
	}
	.icon.audit {
		/* Teal – tydelig, men ikke alarmistisk */
		background: linear-gradient(145deg, #16a085, #0e7668);
		color: white;
	}
</style>
