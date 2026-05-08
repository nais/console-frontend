<script lang="ts">
	import { page } from '$app/state';
	import CreateServiceAccountForm from '$lib/domain/service-accounts/CreateServiceAccountForm.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const form = $derived(page.form);
</script>

<CreateServiceAccountForm teamSlug={data.teamSlug} formData={form} />
