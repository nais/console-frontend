<script lang="ts">
	import { ErrorType, type ValueOf } from '$houdini';

	export let errorType: ValueOf<typeof ErrorType>;
	export let detail: string;
</script>

{#if errorType === ErrorType.DEPRECATED_REGISTRY}
	Deprecated image registry for image {detail}. See
	<a href="https://github.com/nais/docker-build-push">docker-build-push</a>
	on how to migrate to Google Artifact Registry.
{:else if errorType === ErrorType.NO_RUNNING_INSTANCES}
	No running instances.
{:else if errorType === ErrorType.DEPRECATED_INGRESS}
	Ingress {detail} is deprecated. Please change to a valid ingress.
{:else if errorType === ErrorType.INVALID_NAIS_YAML}
	Nais-yaml is invalid.
{:else if errorType === ErrorType.NEW_INSTANCES_FAILING}
	New application instances are failing. Please check log of new instances.
{:else}
	{errorType}
{/if}

<style>
</style>
