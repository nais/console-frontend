<script lang="ts">
	import { Dialog, mergeProps } from 'bits-ui';
	import { XMarkIcon } from '#lib/icons/index.js';
	import type { Component, Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Detail from './Detail.svelte';
	import Heading from './Heading.svelte';

	export interface ModalHeaderProps {
		label?: string;
		icon?: Component;
		heading: string;
		size?: 'medium' | 'small';
		closeButton?: boolean;
	}

	export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
		open: boolean;
		isModal?: boolean;
		closeButton?: boolean;
		backdropClass?: string;
		width?: 'small' | 'medium' | number | `${number}${string}`;
		closeIconText?: string;
		header?: ModalHeaderProps | Snippet | string;
		children: Snippet;
		footer?: Snippet;
		closeOnBackdropClick?: boolean;
		placement?: 'top' | 'center';
		onBeforeClose?: () => boolean;
		onclose?: (e: Event) => void;
		oncancel?: (e: Event) => void;
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		open = $bindable(false),
		closeButton = true,
		backdropClass,
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
		oncancel,
		id,
		style,
		class: className = '',
		...rest
	}: ModalProps = $props();

	let portalAnchor = $state<HTMLSpanElement | null>(null);
	const portalTarget = $derived(portalAnchor?.closest('.sh-theme-root') ?? undefined);
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

	let widthStyle = $derived.by(() => {
		if (typeof width === 'number') {
			return `max-width: min(${width}px, calc(100vw - var(--nais-space-32)));`;
		}
		if (typeof width === 'string' && width !== 'small' && width !== 'medium') {
			return `max-width: min(${width}, calc(100vw - var(--nais-space-32)));`;
		}
		return undefined;
	});
</script>

<span
	hidden
	{@attach (element) => {
		portalAnchor = element;
		return () => {
			portalAnchor = null;
		};
	}}
></span>
<Dialog.Root
	bind:open
	onOpenChangeComplete={(isOpen) => {
		if (!isOpen) onclose?.(new Event('close'));
	}}
>
	{#if portalAnchor}
		<Dialog.Portal to={portalTarget}>
			<div
				class={['sh-modal-layer', { 'sh-modal-layer--top': placement === 'top' }]}
				hidden={!open}
			>
				{#if isModal}
					<Dialog.Overlay class={['sh-modal-backdrop', backdropClass]} />
				{/if}
				<Dialog.Content
					id={id ?? undefined}
					forceMount
					trapFocus={isModal}
					preventScroll={isModal}
					onEscapeKeydown={(event) => {
						const cancelEvent = new Event('cancel', { cancelable: true });
						oncancel?.(cancelEvent);
						if (cancelEvent.defaultPrevented || onBeforeClose?.() === false) event.preventDefault();
					}}
					onInteractOutside={(event) => {
						if (!isModal || !closeOnBackdropClick || onBeforeClose?.() === false) {
							event.preventDefault();
						}
					}}
				>
					{#snippet child({ props })}
						<div
							{...mergeProps(props, rest)}
							aria-modal={isModal ? 'true' : undefined}
							class={[
								'sh-modal',
								{
									'sh-modal--small': width === 'small',
									'sh-modal--medium': width === 'medium'
								},
								className
							]}
							style={[widthStyle, style].filter(Boolean).join(';')}
						>
							{#if header || showCloseButton}
								<div class="sh-modal__header">
									<div class="sh-modal__header-content">
										{#if headerObj}
											{#if headerObj.label}
												<Detail>{headerObj.label}</Detail>
											{/if}
											<Dialog.Title id={ariaLabelId} level={2}>
												{#snippet child({ props })}
													<Heading {...props} size={headerObj.size ?? 'medium'} level="2">
														{#if headerObj.icon}
															{const IconComp = $derived(headerObj.icon)}
															<IconComp aria-hidden="true" />
														{/if}
														{headerObj.heading}
													</Heading>
												{/snippet}
											</Dialog.Title>
										{:else if typeof header === 'string'}
											<Dialog.Title id={ariaLabelId} level={2}>
												{#snippet child({ props })}
													<Heading {...props} level="2" size="medium">{header}</Heading>
												{/snippet}
											</Dialog.Title>
										{:else if isHeaderSnippet(header)}
											<Dialog.Title id={ariaLabelId} level={2}>
												{#snippet child({ props })}
													<div {...props} role={undefined} aria-level={undefined}>
														{@render header()}
													</div>
												{/snippet}
											</Dialog.Title>
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
						</div>
					{/snippet}
				</Dialog.Content>
			</div>
		</Dialog.Portal>
	{/if}
</Dialog.Root>

<style>
	.sh-modal-layer {
		position: fixed;
		inset: 0;
		z-index: 1100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--nais-space-16);
		pointer-events: none;
	}
	.sh-modal-layer[hidden] {
		display: none;
	}
	.sh-modal-layer--top {
		align-items: flex-start;
		padding-top: var(--sh-modal-top-offset);
	}
	.sh-modal-layer--top :global(.sh-modal) {
		max-height: calc(100dvh - var(--sh-modal-top-offset) - var(--nais-space-16));
	}
	:global(.sh-modal-backdrop) {
		position: fixed;
		inset: 0;
		background-color: var(--sh-modal-backdrop);
		backdrop-filter: blur(var(--nais-space-2));
	}
	:global(.sh-modal) {
		position: relative;
		pointer-events: auto;
		padding: 0;
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius-lg);
		background-color: var(--popover);
		color: var(--popover-foreground);
		box-shadow: var(--sh-shadow-lg);
		max-width: min(var(--sh-modal-max-width), calc(100vw - var(--nais-space-32)));
		width: 100%;
		max-height: calc(100dvh - var(--nais-space-32));
		overflow-y: auto;
	}
	:global(.sh-modal--small) {
		max-width: min(var(--sh-modal-small-max-width), calc(100vw - var(--nais-space-32)));
	}
	:global(.sh-modal--medium) {
		max-width: min(var(--sh-modal-medium-max-width), calc(100vw - var(--nais-space-32)));
	}
	.sh-modal__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--nais-space-12);
		padding: var(--nais-space-16) var(--nais-space-20) var(--nais-space-12);
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
		width: var(--nais-space-28);
		height: var(--nais-space-28);
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
	.sh-modal__close:focus-visible {
		outline: var(--nais-space-2) solid var(--ring);
		outline-offset: var(--nais-space-2);
	}
	.sh-modal__body {
		padding: var(--nais-space-20);
	}
	.sh-modal__footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--nais-space-8);
		padding: var(--nais-space-14) var(--nais-space-20);
		border-top: var(--sh-border-width) solid var(--border);
		background-color: color-mix(in srgb, var(--secondary) 35%, var(--popover));
	}
</style>
