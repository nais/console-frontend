<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import { SvelteMap } from 'svelte/reactivity';
	import Confirm from '$lib/ui/Confirm.svelte';
	import {
		Alert,
		BodyShort,
		Button,
		CopyButton,
		Heading,
		HelpText,
		Loader,
		Modal,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';

	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import {
		DocPencilIcon,
		EyeSlashIcon,
		PadlockLockedIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import AddKeyValue from './AddKeyValue.svelte';
	import ElevationModal from './ElevationModal.svelte';
	import Manifest from './Manifest.svelte';
	import Metadata from './Metadata.svelte';
	import Textarea from './Textarea.svelte';
	import Workloads from './Workloads.svelte';

	let { data }: PageProps = $props();

	let { Secret, teamSlug } = $derived(data);
	let secret = $derived($Secret.data?.team.environment.secret);

	let secretName = $derived(page.params.secret ?? '');
	let env = $derived(page.params.env ?? '');

	let deleteSecretOpen = $state(false);
	let deleteValueOpen = $state(false);
	let editValueOpen = $state(false);
	let elevationModalOpen = $state(false);

	let keyToDelete = $state('');
	let keyToEdit = $state('');
	let valueToEdit = $state('');

	// Elevation state - secrets are hidden by default
	let secretsRevealed = $state(false);
	let elevationExpiresAt = $state<Date | null>(null);

	// Check if we have an active elevation on page load
	const checkElevation = graphql(`
		query CheckSecretElevation($input: ElevationInput!) @cache(policy: NetworkOnly) {
			me {
				... on User {
					elevations(input: $input) {
						id
						expiresAt
					}
				}
			}
		}
	`);

	// Fetch secret values after elevation (requires elevation to succeed)
	const fetchSecretValues = graphql(`
		query FetchSecretValues($secret: String!, $team: Slug!, $env: String!)
		@cache(policy: NetworkOnly) {
			team(slug: $team) {
				environment(name: $env) {
					secret(name: $secret) {
						values {
							name
							value
						}
					}
				}
			}
		}
	`);

	// Store for revealed secret values
	let revealedValues = new SvelteMap<string, string>();
	$effect(() => {
		if (teamSlug && env && secretName) {
			checkElevation
				.fetch({
					variables: {
						input: {
							type: 'SECRET',
							team: teamSlug,
							environmentName: env,
							resourceName: secretName
						}
					}
				})
				.then(async () => {
					const elevations =
						($checkElevation.data?.me?.__typename === 'User'
							? $checkElevation.data.me.elevations
							: []) ?? [];
					if (elevations.length > 0) {
						secretsRevealed = true;
						elevationExpiresAt = new Date(elevations[0].expiresAt);
						// Fetch the actual secret values now that we have elevation
						await loadSecretValues();
					}
				});
		}
	});

	const loadSecretValues = async () => {
		await fetchSecretValues.fetch({
			variables: {
				secret: secretName,
				team: teamSlug,
				env: env
			}
		});
		const values = $fetchSecretValues.data?.team.environment.secret?.values ?? [];
		revealedValues.clear();
		for (const v of values) {
			revealedValues.set(v.name, v.value);
		}
	};

	// Auto-hide secrets when elevation expires
	$effect(() => {
		if (elevationExpiresAt) {
			const now = new Date();
			const msUntilExpiry = elevationExpiresAt.getTime() - now.getTime();
			if (msUntilExpiry > 0) {
				const timeout = setTimeout(() => {
					secretsRevealed = false;
					elevationExpiresAt = null;
				}, msUntilExpiry);
				return () => clearTimeout(timeout);
			} else {
				secretsRevealed = false;
				elevationExpiresAt = null;
			}
		}
	});

	const handleElevationSuccess = async () => {
		secretsRevealed = true;
		// Set expiry to 5 minutes from now (matches the durationMinutes in ElevationModal)
		elevationExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
		// Fetch the actual secret values now that we have elevation
		await loadSecretValues();
	};

	const hideSecrets = () => {
		secretsRevealed = false;
		revealedValues.clear();
	};

	const revealSecrets = async () => {
		// First check if we already have an active elevation
		await checkElevation.fetch({
			variables: {
				input: {
					type: 'SECRET',
					team: teamSlug,
					environmentName: env,
					resourceName: secretName
				}
			}
		});

		const elevations =
			($checkElevation.data?.me?.__typename === 'User' ? $checkElevation.data.me.elevations : []) ??
			[];
		if (elevations.length > 0) {
			// Already have elevation, just reveal
			secretsRevealed = true;
			elevationExpiresAt = new Date(elevations[0].expiresAt);
			await loadSecretValues();
		} else {
			// Need to request elevation
			elevationModalOpen = true;
		}
	};

	const updateSecretValue = graphql(`
		mutation updateSecretValue(
			$name: String!
			$team: Slug!
			$env: String!
			$value: SecretValueInput!
		) {
			updateSecretValue(input: { environment: $env, name: $name, team: $team, value: $value }) {
				secret {
					id
					keys
					lastModifiedBy {
						name
						email
					}
					lastModifiedAt
				}
			}
		}
	`);

	const editValueForKey = async () => {
		if (keyToEdit == '') {
			return;
		}
		await updateSecretValue.mutate({
			name: secretName,
			team: teamSlug,
			env: env,
			value: {
				name: keyToEdit,
				value: valueToEdit
			}
		});

		if ($updateSecretValue.errors) {
			return;
		}

		// Update the local revealed values map with the new value
		if (secretsRevealed) {
			revealedValues.set(keyToEdit, valueToEdit);
		}

		editValueOpen = false;
		keyToEdit = '';
	};

	const removeSecretValue = graphql(`
		mutation removeSecretValue($name: String!, $team: Slug!, $env: String!, $valueName: String!) {
			removeSecretValue(
				input: { environment: $env, secretName: $name, team: $team, valueName: $valueName }
			) {
				secret {
					id
					keys
					lastModifiedBy {
						name
						email
					}
					lastModifiedAt
				}
			}
		}
	`);

	const deleteValueFromSecret = async () => {
		if (keyToDelete == '') {
			return;
		}
		await removeSecretValue.mutate({
			name: secretName,
			team: teamSlug,
			env: env,
			valueName: keyToDelete
		});

		if ($removeSecretValue.errors) {
			return;
		}

		// Remove from local revealed values map
		if (secretsRevealed) {
			revealedValues.delete(keyToDelete);
		}

		deleteValueOpen = false;
		keyToDelete = '';
	};

	const deleteMutation = graphql(`
		mutation deleteSecret($name: String!, $team: Slug!, $env: String!) {
			deleteSecret(input: { name: $name, team: $team, environment: $env }) {
				secretDeleted
			}
		}
	`);

	const deleteSecret = async () => {
		await deleteMutation.mutate({
			name: secretName,
			team: teamSlug,
			env: env
		});

		if ($deleteMutation.errors) {
			return;
		}

		await goto('/team/' + teamSlug + '/secrets');
	};

	const openDeleteModal = () => {
		deleteSecretOpen = true;
	};

	const openDeleteValueModal = (key: string) => {
		keyToDelete = key;
		deleteValueOpen = true;
	};

	const openEditValueModal = (key: string, value: string) => {
		keyToEdit = key;
		valueToEdit = value;
		editValueOpen = true;
	};

	const cancelEditValue = () => {
		editValueOpen = false;
		keyToEdit = '';
		valueToEdit = '';
	};

	const formatTimeRemaining = (expiresAt: Date): string => {
		const now = new Date();
		const diff = expiresAt.getTime() - now.getTime();
		const minutes = Math.floor(diff / 60000);
		const seconds = Math.floor((diff % 60000) / 1000);
		if (minutes > 0) {
			return `${minutes} min ${seconds} sek`;
		}
		return `${seconds} sek`;
	};
</script>

<GraphErrors errors={$Secret.errors} />

{#if $Secret.fetching}
	<Loader />
{:else if secret}
	<Confirm
		confirmText="Delete"
		variant="danger"
		bind:open={deleteSecretOpen}
		onconfirm={deleteSecret}
	>
		{#snippet header()}
			<Heading as="h1" size="large">Delete Secret</Heading>
		{/snippet}
		<p>
			This will permanently delete the secret named <b>{secret.name}</b>
			from <b>{env}</b>.
		</p>
		{#if secret.workloads.nodes.length > 0}
			<p>These workloads still reference the secret:</p>
			<ul>
				{#each secret.workloads.nodes as workload (workload.id)}
					<li>
						<WorkloadLink {workload} />
					</li>
				{/each}
			</ul>
			<br />
		{/if}

		Are you sure you want to delete this secret?
	</Confirm>
	<Confirm
		confirmText="Delete key"
		variant="danger"
		bind:open={deleteValueOpen}
		onconfirm={deleteValueFromSecret}
	>
		{#snippet header()}
			<Heading as="h1" size="large">Delete Key From Secret</Heading>
		{/snippet}
		<p>
			This will permanently delete the key <b>{keyToDelete}</b> from the secret named
			<b>{secret.name}</b>
			from <b>{env}</b>.
		</p>
		{#if secret.workloads.nodes.length > 0}
			<p>These workloads reference the secret:</p>
			<ul>
				{#each secret.workloads.nodes as workload (workload.id)}
					<li>
						<WorkloadLink {workload} />
					</li>
				{/each}
			</ul>
			<br />
		{/if}

		Are you sure you want to delete <b>{keyToDelete}</b> from this secret?
	</Confirm>

	<ElevationModal
		bind:open={elevationModalOpen}
		{teamSlug}
		environmentName={env}
		{secretName}
		onSuccess={handleElevationSuccess}
	/>

	<div
		style="display: flex; flex-direction: row; justify-content: flex-end; padding-bottom: var(--spacing-layout);"
	></div>
	<div class="wrapper">
		<div>
			<div class="alerts">
				{#if $deleteMutation.errors}
					<GraphErrors errors={$deleteMutation.errors} />
				{/if}
			</div>
			<div class="data-heading">
				<div style="display: flex; align-items: center; gap: var(--ax-space-8);">
					<Heading as="h2">Secret Data</Heading>
					<HelpText title="Secret data" placement="right">
						A secret contains a set of key-value pairs.
					</HelpText>
				</div>
				<div class="header-buttons">
					{#if secretsRevealed}
						<Button
							variant="secondary"
							size="small"
							onclick={hideSecrets}
							icon={EyeSlashIcon}
							title="Skjul hemmeligheter"
						>
							Skjul verdier
						</Button>
					{:else}
						<Button
							variant="secondary"
							size="small"
							onclick={revealSecrets}
							icon={PadlockLockedIcon}
							title="Vis hemmeligheter (krever begrunnelse)"
						>
							Vis verdier
						</Button>
					{/if}
					<Button
						class="delete-secret"
						title="Delete secret from environment"
						variant="danger"
						size="small"
						onclick={openDeleteModal}
						icon={TrashIcon}
					>
						Delete
					</Button>
				</div>
			</div>

			{#if secretsRevealed && elevationExpiresAt}
				<div class="elevation-info">
					<Alert variant="info" size="small">
						<BodyShort>
							Du har tilgang til å se hemmeligheter. Tilgangen utløper om
							<strong>{formatTimeRemaining(elevationExpiresAt)}</strong>.
						</BodyShort>
					</Alert>
				</div>
			{/if}

			<Table size="small" style="margin-top: 2rem">
				<Thead>
					<Tr>
						<Th>Key</Th>
						<Th>Value</Th>
						<Th align="right">Actions</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each secret.keys as keyName (keyName)}
						<Tr>
							<Td>
								<p class="key">
									{keyName}
								</p>
							</Td>
							<Td>
								<code class="value">
									{#if secretsRevealed && revealedValues.has(keyName)}
										{revealedValues.get(keyName)}
									{:else}
										••••••••••••••••••••
									{/if}
								</code>
							</Td>
							<Td style="width: 120px" align="right">
								<div class="buttons">
									{#if secretsRevealed && revealedValues.has(keyName)}
										<CopyButton
											activeText="Value copied"
											variant="action"
											size="small"
											copyText={revealedValues.get(keyName) ?? ''}
										/>
										<Button
											size="small"
											variant="tertiary"
											title="Show or edit secret value"
											onclick={() => {
												openEditValueModal(keyName, revealedValues.get(keyName) ?? '');
											}}
											icon={DocPencilIcon}
										/>
									{:else}
										<Button
											size="small"
											variant="tertiary"
											title="Krev elevering for å se eller kopiere verdier"
											onclick={revealSecrets}
											icon={PadlockLockedIcon}
										/>
									{/if}

									<Button
										size="small"
										variant="tertiary-neutral"
										title="Delete key and value"
										onclick={() => {
											openDeleteValueModal(keyName);
										}}
									>
										{#snippet icon()}
											<TrashIcon style="color:var(--ax-text-danger-decoration)!important" />
										{/snippet}
									</Button>
								</div>
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
			<AddKeyValue initial={secret.keys.map((k) => ({ name: k }))} {teamSlug} {env} {secretName} />
		</div>
		<div class="sidebar">
			<Metadata lastModifiedAt={secret.lastModifiedAt} lastModifiedBy={secret.lastModifiedBy} />
			<Workloads workloads={secret.workloads} />
			<Manifest {secretName} />
		</div>
	</div>
{/if}
<Modal bind:open={editValueOpen} onclose={cancelEditValue} width="medium">
	{#snippet header()}
		<Heading as="h1" size="large">Editing Value of Key <i>{keyToEdit}</i></Heading>
	{/snippet}
	{#if ($Secret.data?.team.environment.secret.workloads.nodes ?? []).length > 0}
		<Alert variant="info" size="small">
			<BodyShort
				>Editing this secret will cause a restart of the applications listed below.</BodyShort
			>
			<ul>
				{#each $Secret.data?.team.environment.secret.workloads.nodes ?? [] as workload (workload.id)}
					<li><WorkloadLink {workload} /></li>
				{/each}
			</ul>
		</Alert>
	{/if}
	<div class="entry">
		<Textarea bind:text={valueToEdit} label="Value" description="Example: some-value" />
	</div>
	{#snippet footer()}
		<Button variant="primary" size="small" onclick={editValueForKey}>Save</Button>
		<Button variant="secondary" size="small" onclick={cancelEditValue}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.buttons {
		display: flex;
	}

	.alerts {
		margin-bottom: 1rem;
	}
	.entry {
		margin: 2rem 0;
	}

	.data-heading {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.header-buttons {
		display: flex;
		gap: var(--ax-space-8);
	}

	.elevation-info {
		margin-top: var(--ax-space-16);
	}

	.value {
		font-family: var(--ax-font-family-mono);
		font-size: var(--ax-font-size-small);
		word-break: break-all;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0 0 0 1rem;
	}
</style>
