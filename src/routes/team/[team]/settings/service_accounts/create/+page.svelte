<script lang="ts">
	import CreateServiceAccountForm from '$lib/domain/service-accounts/CreateServiceAccountForm.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<CreateServiceAccountForm formData={form} />
