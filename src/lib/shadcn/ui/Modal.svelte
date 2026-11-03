<script lang="ts">
	import { XMarkIcon } from '#lib/icons/index.js';
	import type { Component, Snippet } from 'svelte';
	import type { HTMLDialogAttributes } from 'svelte/elements';
	import Detail from './Detail.svelte';
	import Heading from './Heading.svelte';

	export interface ModalHeaderProps {
		label?: string;
		icon?: Component;
		heading: string;
		size?: 'medium' | 'small';
		closeButton?: boolean;
	}

	export interface ModalProps extends HTMLDialogAttributes {
		open: boolean;
		isModal?: boolean;
		closeButton?: boolean;
		width?: 'small' | 'medium' | number | `${number}${string}`;
		closeIconText?: string;
		header?: ModalHeaderProps | Snippet | string;
		children: Snippet;
		footer?: Snippet;
		closeOnBackdropClick?: boolean;
		placement?: 'top' | 'center';
		onBeforeClose?: () => boolean;
		onclose?: (e: Event) => void;
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		open = $bindable(false),
		closeButton = true,
		isModal = true,
		width,
		closeIconText = 'Close',
		header,
		children,
		footer,
		closeOnBackdropClick = true,
		placement = 'center',
		onBeforeClose,
		onclose,
		class: className = '',
		...rest
	}: ModalProps = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	const ariaLabelId = `modal-heading-${uid}`;

	function isHeaderObject(h: unknown): h is ModalHeaderProps {
		return typeof h === 'object' && h !== null && 'heading' in h;
	}

	function isHeaderSnippet(h: unknown): h is Snippet {
		return typeof h === 'function';
	}

	let headerObj = $derived(isHeaderObject(header) ? header : null);
	let showCloseButton = $derived(headerObj ? headerObj.closeButton !== false : closeButton);

	function tryClose(): boolean {
		if (onBeforeClose && onBeforeClose() === false) {
			return false;
		}
		open = false;
		return true;
	}

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			if (isModal && dialog.showModal) {
				dialog.showModal();
			} else if (dialog.show) {
				dialog.show();
			}
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	let widthStyle = $derived.by(() => {
		if (typeof width === 'number') return `max-width: ${width}px; width: 100%;`;
		if (typeof width === 'string' && width !== 'small' && width !== 'medium') {
			return `max-width: ${width}; width: 100%;`;
		}
		return undefined;
	});
</script>

<dialog
	bind:this={dialog}
	aria-labelledby={(rest['aria-labelledby'] as string | undefined) ??
		(headerObj ? ariaLabelId : undefined)}
	class={[
		'sh-modal',
		{
			'sh-modal--small': width === 'small',
			'sh-modal--medium': width === 'medium',
			'sh-modal--top': placement === 'top'
		},
		className
	]}
	style={widthStyle}
	onclose={(e) => {
		open = false;
		onclose?.(e);
	}}
	oncancel={(e) => {
		if (onBeforeClose && onBeforeClose() === false) {
			e.preventDefault();
		}
	}}
	onclick={closeOnBackdropClick
		? (e) => {
				if (e.target === dialog) {
					tryClose();
				}
			}
		: undefined}
	{...rest}
>
	{#if header || showCloseButton}
		<div class="sh-modal__header">
			<div class="sh-modal__header-content">
				{#if headerObj}
					{#if headerObj.label}
						<Detail>{headerObj.label}</Detail>
					{/if}
					<Heading size={headerObj.size ?? 'medium'} level="2" id={ariaLabelId}>
						{#if headerObj.icon}
							{const IconComp = $derived(headerObj.icon)}
							<IconComp aria-hidden="true" />
						{/if}
						{headerObj.heading}
					</Heading>
				{:else if typeof header === 'string'}
					<Heading level="2" size="medium">{header}</Heading>
				{:else if isHeaderSnippet(header)}
					{@render header()}
				{/if}
			</div>
			{#if showCloseButton}
				<button
					type="button"
					class="sh-modal__close"
					aria-label={closeIconText}
					onclick={() => tryClose()}
				>
					<XMarkIcon aria-hidden="true" />
				</button>
			{/if}
		</div>
	{/if}
	<div class="sh-modal__body">
		{@render children()}
	</div>
	{#if footer}
		<div class="sh-modal__footer">
			{@render footer()}
		</div>
	{/if}
</dialog>

<style>
	.sh-modal {
		padding: 0;
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius-lg);
		background-color: var(--popover);
		color: var(--popover-foreground);
		box-shadow: var(--sh-shadow-lg);
		max-width: min(var(--sh-modal-max-width), calc(100vw - var(--ax-space-32)));
		width: 100%;
	}
	.sh-modal--small {
		max-width: min(var(--sh-modal-small-max-width), calc(100vw - var(--ax-space-32)));
	}
	.sh-modal--medium {
		max-width: min(var(--sh-modal-medium-max-width), calc(100vw - var(--ax-space-32)));
	}
	.sh-modal--top {
		margin-top: var(--sh-modal-top-offset);
	}
	.sh-modal::backdrop {
		background-color: var(--sh-modal-backdrop);
		backdrop-filter: blur(var(--ax-space-2));
	}
	.sh-modal__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--ax-space-12);
		padding: var(--ax-space-16) var(--ax-space-20) var(--ax-space-12);
		border-bottom: var(--sh-border-width) solid var(--border);
	}
	.sh-modal__header-content {
		min-width: 0;
		flex: 1;
	}
	.sh-modal__close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--ax-space-28);
		height: var(--ax-space-28);
		border: none;
		border-radius: var(--radius-xs);
		background: transparent;
		color: var(--muted-foreground);
		cursor: pointer;
		flex-shrink: 0;
	}
	.sh-modal__close:hover {
		background-color: var(--secondary);
		color: var(--foreground);
	}
	.sh-modal__body {
		padding: var(--ax-space-20);
	}
	.sh-modal__footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--ax-space-8);
		padding: var(--ax-space-14) var(--ax-space-20);
		border-top: var(--sh-border-width) solid var(--border);
		background-color: color-mix(in srgb, var(--secondary) 35%, var(--popover));
	}
</style>
