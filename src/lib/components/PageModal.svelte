<script lang="ts" module>
	import { page } from '$app/state';

	export async function pageModalClick(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLAnchorElement;
		}
	) {
		if (
			innerWidth < 640 || // bail if the screen is too small
			e.shiftKey || // or the link is opened in a new window
			e.metaKey ||
			e.ctrlKey // or a new tab (mac: metaKey, win/linux: ctrlKey)
		) {
			return;
		}

		// prevent navigation
		e.preventDefault();

		const { href } = e.currentTarget;

		pushState(href, { modalHref: href });
	}

	/**
	 * Returns true if the current page is possibly rendered inside a modal.
	 * This should not be used on pages that might have nested modals.
	 */
	export function isPossiblyInModal() {
		return !!page.state.modalHref;
	}
</script>

<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation';
	import { Loader, Modal } from '@nais/ds-svelte-community';
	import type { ModalProps } from '@nais/ds-svelte-community/components/Modal/type.js';
	import type { Component, Snippet } from 'svelte';

	let {
		content: Page,
		header,
		loading
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		content: Component<any, any, string>;
		header?: ModalProps['header'];
		loading?: Snippet;
	} = $props();

	let modalData = $state();

	let open = $state(false);

	$effect(() => {
		if (page.state.modalHref) {
			modalData = undefined;

			open = true;
			const href = page.state.modalHref;
			// run `load` functions (or rather, get the result of the `load` functions
			// that are already running because of `data-sveltekit-preload-data`)
			preloadData(href).then((result) => {
				if (result.type === 'loaded' && result.status === 200) {
					modalData = result.data;
				} else {
					// something bad happened! try navigating
					goto(href);
				}
			});
		} else {
			modalData = undefined;
		}
	});
</script>

<Modal
	onclose={() => {
		history.back();
		modalData = undefined;
		open = false;
	}}
	{open}
	{header}
>
	{#if !modalData}
		{#if loading}
			{@render loading()}
		{:else}
			<Loader />
		{/if}
	{:else}
		<Page data={modalData} />
	{/if}
</Modal>
