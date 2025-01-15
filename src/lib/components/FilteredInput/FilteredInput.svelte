<script lang="ts" module>
	export interface FilterValue {
		value: string;
		label?: string;
		icon?: Component;
	}

	export interface Filter {
		key: string;
		single?: boolean;
		values?: FilterValue[] | ((value: string) => Promise<FilterValue[]>);
	}

	export interface AppliedFilter {
		key: string;
		value: string;
	}
</script>

<script lang="ts">
	import { Loader } from '@nais/ds-svelte-community';
	import type { Component } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import FormatFilter from './FormatFilter.svelte';
	import FormatText from './FormatText.svelte';

	interface Props extends HTMLInputAttributes {
		supportedFilters: Filter[];
		allowFreeText?: boolean;
		freetext?: string;
		filters: AppliedFilter[];
		value?: string;
	}

	let {
		supportedFilters,
		allowFreeText = true,
		freetext = $bindable(''),
		filters = $bindable([]),
		value = $bindable(''),
		...restProps
	}: Props = $props();

	let content = $state('');
	let inputEl: HTMLInputElement | null = $state(null);
	let caretEl: HTMLSpanElement | null = $state(null);
	let wrapperEl: HTMLDivElement | null = $state(null);
	let dropdownGroup: HTMLDivElement | null = $state(null);
	let caretPosition = $state(0);
	let caretOffetWidth = $state(0);
	let active = $state(false);
	let activeOptionIndex = $state(0);

	type FilterElements =
		| {
				type: 'text';
				content: string;
				length: number;
		  }
		| {
				type: 'filter';
				key: string;
				value: string;
				length: number;
		  };

	let formatted: FilterElements[] = $derived.by(() => {
		const filters = content.split(' ');
		return filters.map((filter) => {
			const [key, value] = filter.split(':');
			const supportedFilter = supportedFilters.find((f) => f.key === key);
			if (!supportedFilter || value === undefined) {
				return { type: 'text', content: filter, length: filter.length };
			}
			return {
				type: 'filter',
				key,
				value,
				length: filter.length
			};
		});
	});

	let activeFormatElement = $derived.by(() => {
		let length = 0;
		for (let i = 0; i < formatted.length; i++) {
			const e = formatted[i];
			length += e.length;
			if (length + i >= caretPosition) {
				return e;
			}
		}
		return null;
	});

	type FilterMap = {
		[K in FilterElements as K['type']]: Component<Omit<K, 'type'>>;
	};

	const fomatters: FilterMap = {
		text: FormatText,
		filter: FormatFilter
	};

	function updateCaretOffsetWidth() {
		if (wrapperEl && caretEl) {
			caretOffetWidth = caretEl.offsetLeft;
		}
	}

	let preventKeyUp = false;
	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (event.key === ' ' || event.key === 'Backspace') {
			// Update popover position when pressing space or backspace
			updateCaretOffsetWidth();
		}
		if (!activeFormatElement) {
			restProps.onkeydown?.(event);
			return;
		}

		// We should handle the keydown event when we have an active format element
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			const numElements = dropdownGroup?.children.length ?? 0;
			let newIndex = activeOptionIndex + 1;
			if (newIndex < numElements) {
				activeOptionIndex = newIndex;
			} else {
				activeOptionIndex = 0;
			}
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			const numElements = dropdownGroup?.children.length ?? 0;
			let newIndex = activeOptionIndex - 1;
			if (newIndex >= 0) {
				activeOptionIndex = newIndex;
			} else {
				activeOptionIndex = numElements - 1;
			}
		} else if (event.key === 'Enter') {
			event.preventDefault();
			//TODO: preventKeyUp = true;
			const activeElementValue = (dropdownGroup?.querySelector('.active') as HTMLDivElement)
				?.dataset.value;
			if (activeElementValue) {
				preventKeyUp = true;
				event.preventDefault();
				let restoreTo = -1;
				if (activeFormatElement.type === 'text') {
					// Ensure we replace the text the caret is currently in
					let start = Math.max(0, caretPosition - 1);
					for (let i = start; i >= 0; i--) {
						if (content[i] === ' ') {
							start = i + 1;
							break;
						}
						if (i === 0) {
							start = 0;
						}
					}
					restoreTo = start + activeElementValue.length + 1;
					content =
						content.slice(0, start) + activeElementValue + ':' + content.slice(caretPosition);
				} else {
					// Ensure we replace the text the caret is currently in
					let start = caretPosition;
					for (let i = start; i >= 0; i--) {
						if (content[i] === ':') {
							start = i + 1;
							break;
						}
					}
					restoreTo = start + activeElementValue.length + 1;
					content =
						content.slice(0, start) + activeElementValue + ' ' + content.slice(caretPosition);
				}

				if (restoreTo >= 0) {
					queueMicrotask(() => {
						if (inputEl) {
							inputEl.selectionStart = restoreTo;
							inputEl.selectionEnd = restoreTo;
							caretPosition = restoreTo;
						}
					});
				}
			}

			queueMicrotask(updateCaretOffsetWidth);
		}
	}

	function captureCaretPosition(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
	) {
		if (preventKeyUp) {
			preventKeyUp = false;
			event.preventDefault();
			return;
		}
		caretPosition = inputEl?.selectionStart ?? 0;
		restProps.onkeyup?.(event);
	}

	let elements = $derived.by(() => {
		if (!activeFormatElement) {
			return null;
		}

		if (activeFormatElement.type === 'text') {
			return supportedFilters
				.filter((f) => {
					// Filter out the filters that should only be used once
					if (f.single && formatted.find((fo) => fo.type == 'filter' && f.key === fo.key)) {
						return false;
					}
					// Filter out the filters that are not matching the current text
					return f.key.startsWith(activeFormatElement.content.toLowerCase());
				})
				.map((f) => ({ value: f.key, label: f.key }));
		} else if (activeFormatElement.type === 'filter') {
			const filter = supportedFilters.find((f) => f.key === activeFormatElement.key);
			if (filter) {
				if (typeof filter.values === 'function') {
					return filter.values(activeFormatElement.value);
				} else {
					return filter.values?.filter((v) =>
						v.value.toLowerCase().startsWith(activeFormatElement.value.toLowerCase())
					);
				}
			}
		}
		return null;
	});

	let showPopover = $derived(active && !!elements);

	// Update bindables
	$effect(() => {
		filters = formatted
			.filter((f) => f.type === 'filter')
			.map((f) => ({ key: f.key, value: f.value }));
		freetext = formatted
			.filter((f) => f.type === 'text')
			.map((f) => f.content)
			.join(' ')
			.trim();
	});
	$effect(() => {
		value = content;
	});

	export const omit = (obj: object, ...props: string[]) =>
		Object.entries(obj)
			.filter(([key]) => !props.includes(key))
			.reduce(
				(obj, [key, value]) => ({
					...obj,
					[key]: value
				}),
				{}
			);
</script>

<div class="wrapper navds-form-field navds-form-field--small" bind:this={wrapperEl}>
	<div class="caretpositioner navds-body-short navds-body-short--small" aria-hidden="true">
		{content.slice(0, caretPosition)}<span class="caret" bind:this={caretEl}></span>
	</div>
	<div class="formatted navds-body-short navds-body-short--small" aria-hidden="true">
		{#each formatted as filter, i}
			{@const Formatter = fomatters[filter.type] as Component}
			{#if i > 0}
				<span class="delimiter">{' '}</span>
			{/if}
			<Formatter {...filter} {allowFreeText} />
		{/each}
	</div>
	<input
		{...omit(restProps, 'onkeydown', 'onkeyup')}
		bind:value={content}
		bind:this={inputEl}
		type="text"
		class="navds-text-field__input navds-body-short navds-body-short--small"
		onkeydown={handleKeyDown}
		onkeyup={captureCaretPosition}
		onfocus={() => {
			updateCaretOffsetWidth();
			active = true;
		}}
		onblur={() => {
			active = false;
		}}
	/>

	{#snippet dropdownContent(els: FilterValue[])}
		<div role="group" class="navds-action-menu__group" bind:this={dropdownGroup}>
			{#each els as element, i}
				<div
					role="menuitem"
					tabindex="0"
					class="navds-action-menu__item"
					class:active={activeOptionIndex == i}
					data-value={element.value}
					data-index={i}
				>
					{element.label ?? element.value}
				</div>
			{/each}
		</div>
	{/snippet}

	{#if showPopover && elements}
		{#if typeof elements === 'object' && !Array.isArray(elements)}
			{#await elements}
				<div class="popover" style:left={caretOffetWidth + 'px'}>
					<div
						role="menu"
						class="navds-action-menu__content"
						tabindex="0"
						style="outline: none; --__ac-action-menu-content-transform-origin: var(--ac-floating-transform-origin); --__ac-action-menu-content-available-height: var(--ac-floating-available-height); pointer-events: auto;"
					>
						<div class="navds-action-menu__content-inner">
							<Loader />
						</div>
					</div>
				</div>
			{:then els}
				{#if els.length > 0}
					<div class="popover" style:left={caretOffetWidth + 'px'}>
						<div
							role="menu"
							class="navds-action-menu__content"
							tabindex="0"
							style="outline: none; --__ac-action-menu-content-transform-origin: var(--ac-floating-transform-origin); --__ac-action-menu-content-available-height: var(--ac-floating-available-height); pointer-events: auto;"
						>
							<div class="navds-action-menu__content-inner">
								{@render dropdownContent(els)}
							</div>
						</div>
					</div>
				{/if}
			{/await}
		{:else if elements.length > 0}
			<div class="popover" style:left={caretOffetWidth + 'px'}>
				<div
					role="menu"
					class="navds-action-menu__content"
					tabindex="0"
					style="outline: none; --__ac-action-menu-content-transform-origin: var(--ac-floating-transform-origin); --__ac-action-menu-content-available-height: var(--ac-floating-available-height); pointer-events: auto;"
				>
					<div class="navds-action-menu__content-inner">
						{@render dropdownContent(elements)}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr;
		flex: 1;
		width: 100%;
		font-size: inherit;
		scrollbar-width: none;
		position: relative;
	}

	.formatted,
	.caretpositioner {
		display: inline-flex;
		-webkit-user-select: none;
		user-select: none;
		white-space: pre;
		word-break: break-word;
		grid-row-start: 1;
		grid-column-start: 1;
		background: var(--ac-textfield-bg, var(--__ac-textfield-bg, var(--a-surface-default)));
		align-items: center;
		padding: 0 var(--a-spacing-2);
		margin: 1px;
		border-radius: var(--a-border-radius-medium);
	}

	.caretpositioner {
		color: transparent !important;
		background: none;
		border: 1px solid transparent;
	}

	input {
		background: transparent;
		caret-color: var(--a-text-default);
		color: transparent;
		/* color: red; */
		display: flex;
		height: 30px;
		min-width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		resize: none;
		grid-row-start: 1;
		grid-column-start: 1;
	}

	.popover {
		position: absolute;
		left: 0px;
		top: 2rem;
		min-width: max-content;
		z-index: 9999999;
		--ac-floating-available-width: 754px;
		--ac-floating-available-height: 214px;
		--ac-floating-anchor-width: 109.53125px;
		--ac-floating-anchor-height: 48px;
		--ac-floating-transform-origin: 0% 0px;
	}

	.navds-action-menu__item.active {
		outline: none;
		background-color: var(--a-surface-action-subtle-hover);
		color: var(--a-text-default);
	}
</style>
