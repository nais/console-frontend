<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ Image } = data);

	$: image = $Image.data?.dependencyTrackProject;
</script>

{#if $Image.errors}
	<Alert variant="error">
		{#each $Image.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if image !== undefined && image.id !== PendingValue}
	<Card columns={12}>
		Name: {image.name}<br />
		Critical: {image.critical}<br />
		Digest: {image.digest}<br />
		Id: {image.id}<br />
		Rekor: {image.rekorId}<br />
		Risk score: {image.riskScore}<br />
		<hr />
		<h1>Findings</h1>
		<Table>
			<Thead>
				<Th>Id</Th>
				<Th>ComponentId</Th>
				<Th>PackageUrl</Th>
				<Th>Severity</Th>
				<Th>Description</Th>
			</Thead>
			<Tbody>
				{#each image.findings as finding}
					<Tr>
						<Td>{finding.id}</Td>
						<Td>{finding.componentId}</Td>
						<Td>{finding.packageUrl}</Td>
						<Td>{finding.severity}</Td>
						<Td>{finding.description}</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	</Card>
{/if}
