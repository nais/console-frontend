<script lang="ts">
	import { page } from '$app/stores';
	import Arrow from '$lib/icons/Arrow.svelte';
	import Globe from '$lib/icons/Globe.svelte';
	import { appSpec } from '$lib/mock/appSpec';

	$: app = $page.params.app;
</script>

<div class="traffic">
	<div class="directionContent">
		<div>
			<h5>Inbound:</h5>
			<p>
				{#each appSpec.network.inbound.rules as inbound}
					<a href="/"
						>{inbound.application}{#if inbound.namespace}.{inbound.namespace}{/if}</a
					><br />
				{/each}
			</p>
		</div>
		<div>
			<h5>External:</h5>
			<p>
				{#each appSpec.ingress as ingress}
					<div style="display: flex; align-items: center; flex-direction: row; gap: 0.5rem;">
						<a href="/">{ingress}</a><Globe />
					</div>
				{/each}
			</p>
		</div>
	</div>
	<div class="arrow">
		<Arrow size="2rem" />
	</div>
	<div class="applicationName">
		{app}
	</div>
	<div class="arrow">
		<Arrow size="2rem" />
	</div>
	<div class="directionContent">
		<h5>Outbound:</h5>
		<p>
			{#each appSpec.network.outbound.rules as outbound}
				<a href="/"
					>{outbound.application}{#if outbound.namespace}.{outbound.namespace}{/if}</a
				><br />
			{/each}
		</p>
		<h5>External:</h5>
		<p>
			{#each appSpec.network.outbound.external as outbound}
				<a href="/">{outbound.host}</a><br />
			{/each}
		</p>
	</div>
</div>

<style>
	.traffic {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.directionContent {
		display: flex;
		flex-direction: column;
	}
	.applicationName {
		display: flex;
		align-items: center;
		gap: 3rem;
	}
	.arrow {
		width: 2rem;
		height: 2rem;
		transform: rotate(180deg);
		color: var(--a-icon-default);
	}
	.directionContent,
	h5 {
		margin: 0;
	}
	.directionContent,
	p {
		margin-top: 0;
	}
</style>
