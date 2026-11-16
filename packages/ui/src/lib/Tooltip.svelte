<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		content: string;
		open?: boolean;
		defaultOpen?: boolean;
		placement?: 'top' | 'right' | 'bottom' | 'left';
		arrow?: boolean;
		offset?: number;
		delay?: number;
		maxChar?: number;
		describesChild?: boolean;
		keys?: string[];
		children: Snippet<[{ props: Record<string, unknown> }]>;
		[key: string]: unknown;
	}
</script>

<script lang="ts">
	import { Tooltip as BitsTooltip } from 'bits-ui';

	let {
		content,
		open = $bindable(undefined),
		defaultOpen = false,
		placement = 'top',
		keys,
		children,
		class: className = '',
		'aria-describedby': descriptionId,
		...rest
	}: TooltipProps = $props();

	const uid = $props.id();
	let anchorElement = $state<HTMLSpanElement | null>(null);
	const portalTarget = $derived(
		anchorElement?.closest('[data-dialog-content], dialog, .sh-theme-root') ?? undefined
	);
	let hovered = $state(false);
	let focused = $state(false);
	let dismissed = $state(false);
	let interactiveChild = $state<boolean>();
	let isOpen = $derived(
		open !== undefined ? open : !dismissed && (hovered || focused || defaultOpen)
	);

	function describeChildren(element: HTMLSpanElement) {
		anchorElement = element;
		const selector = 'button, a[href], input, select, textarea, [tabindex]';
		$effect(() => {
			const visible = isOpen;
			const targets: HTMLElement[] = [];
			function removeDescription(target: HTMLElement) {
				const ids = (target.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
				const next = ids.filter((id) => id !== uid);
				if (next.length) target.setAttribute('aria-describedby', next.join(' '));
				else target.removeAttribute('aria-describedby');
			}
			function describe() {
				const children = [...element.querySelectorAll<HTMLElement>(selector)];
				const hasEnabledChild = children.some(
					(child) => !child.matches(':disabled, [aria-disabled="true"]')
				);
				interactiveChild = hasEnabledChild;
				if (!hasEnabledChild && rest.tabindex === undefined && element.tabIndex !== 0) {
					element.tabIndex = 0;
				} else if (
					hasEnabledChild &&
					rest.tabindex === undefined &&
					element.hasAttribute('tabindex')
				) {
					element.removeAttribute('tabindex');
				}
				for (const target of children) {
					if (!targets.includes(target)) targets.push(target);
					removeDescription(target);
					if (visible) {
						const ids = target.getAttribute('aria-describedby');
						target.setAttribute('aria-describedby', ids ? `${ids} ${uid}` : uid);
					}
				}
			}
			describe();
			const observer = new MutationObserver(describe);
			observer.observe(element, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ['disabled', 'aria-disabled', 'href', 'tabindex']
			});
			return () => {
				observer.disconnect();
				for (const target of targets) removeDescription(target);
			};
		});
		return () => {
			anchorElement = null;
		};
	}

	let triggerProps = $derived({
		title: content,
		'aria-describedby': isOpen ? uid : undefined,
		onmouseenter: () => {
			hovered = true;
		},
		onmouseleave: () => {
			hovered = false;
		},
		onfocus: () => {
			hovered = true;
		},
		onblur: () => {
			hovered = false;
		}
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && isOpen) {
			dismissed = true;
			if (open !== undefined) open = false;
		}
	}}
/>

<BitsTooltip.Provider>
	<BitsTooltip.Root
		open={isOpen}
		onOpenChange={(value) => {
			if (!value) {
				dismissed = true;
				if (open !== undefined) open = false;
			}
		}}
	>
		<span
			{...rest}
			class={['sh-tooltip-anchor', className]}
			data-placement={placement}
			{@attach describeChildren}
			role={interactiveChild === false ? 'button' : undefined}
			aria-label={interactiveChild === false ? content : undefined}
			aria-describedby={[descriptionId, isOpen ? uid : undefined].filter(Boolean).join(' ') ||
				undefined}
			onmouseenter={() => {
				hovered = true;
				dismissed = false;
			}}
			onmouseleave={() => (hovered = false)}
			onfocusin={() => {
				focused = true;
				dismissed = false;
			}}
			onfocusout={(event) => {
				if (
					!(event.relatedTarget instanceof Node) ||
					!event.currentTarget.contains(event.relatedTarget)
				) {
					focused = false;
				}
			}}
			onclick={() => {
				if (!interactiveChild) dismissed = isOpen;
			}}
			onkeydown={(event) => {
				if (!interactiveChild && (event.key === 'Enter' || event.key === ' ')) {
					event.preventDefault();
					dismissed = isOpen;
				}
			}}
		>
			{@render children({ props: triggerProps })}
		</span>
		<BitsTooltip.Portal to={portalTarget}>
			<BitsTooltip.Content
				id={uid}
				role="tooltip"
				class="sh-tooltip-bubble"
				customAnchor={anchorElement}
				side={placement}
				sideOffset={6}
				collisionPadding={8}
				onmouseenter={() => (hovered = true)}
				onmouseleave={() => (hovered = false)}
			>
				<span>{content}</span>
				{#if keys?.length}
					<span class="sh-tooltip-keys">
						{#each keys as k (k)}
							<kbd>{k}</kbd>
						{/each}
					</span>
				{/if}
			</BitsTooltip.Content>
		</BitsTooltip.Portal>
	</BitsTooltip.Root>
</BitsTooltip.Provider>

<style>
	.sh-tooltip-anchor {
		position: relative;
		display: inline-flex;
		align-items: center;
	}
	:global(.sh-tooltip-bubble) {
		z-index: 60;
		max-width: var(--bits-tooltip-content-available-width);
		display: inline-flex;
		align-items: center;
		gap: var(--nais-space-6);
		padding: var(--nais-space-4) var(--nais-space-8);
		border-radius: var(--radius-xs);
		background-color: var(--popover);
		color: var(--popover-foreground);
		border: var(--sh-border-width) solid var(--border);
		box-shadow: var(--sh-shadow-md);
		font-size: var(--sh-font-size-xs);
		font-weight: var(--sh-font-weight-medium);
		overflow-wrap: anywhere;
		pointer-events: auto;
	}
	.sh-tooltip-keys {
		display: inline-flex;
		gap: var(--nais-space-2);
	}
	.sh-tooltip-keys kbd {
		padding: var(--nais-space-1) var(--nais-space-4);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--nais-space-2);
		font-size: var(--sh-font-size-caption);
		font-family: var(--sh-font-family-mono);
	}
</style>
