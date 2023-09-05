<script lang="ts">
	import { ErrorType, type ValueOf } from '$houdini';

	export let error: ValueOf<typeof ErrorType>;
</script>

<div class="message">
	{#if error === ErrorType.DEPRECATED_REGISTRY}
		Deprecated image registry. See <a href="https://github.com/nais/docker-build-push"
			>docker-build-push</a
		> on how to migrate to Google Artifact Registry.
	{:else if error === ErrorType.NO_RUNNING_INSTANCES}
		No running instances.
	{:else if error === ErrorType.DEPRECATED_INGRESS}
		Ingress is deprecated.
	{:else if error === ErrorType.INVALID_NAIS_YAML}
		Nais-yaml is invalid.
	{:else if error === ErrorType.NEW_INSTANCES_FAILING}
		New application instances are failing.
	{:else}
		{error}
	{/if}
</div>

<style>
	.message {
		display: flex;
		flex-direction: column;
		white-space: wrap;
	}
</style>
