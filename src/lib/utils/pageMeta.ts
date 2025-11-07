export interface AddPageMetaOptions {
	title?: string;
	breadcrumbs?: App.LayoutData['meta']['breadcrumbs'];
	tag?: App.LayoutData['meta']['tag'];
}

/**
 * Helper function to extend parent page metadata with a new title, optional breadcrumbs, and optional tag.
 * This is commonly used in nested routes where you want to inherit
 * the parent's metadata but override the title and add additional breadcrumbs or tags.
 *
 * @param event - The SvelteKit load event with a parent() method
 * @param options - Options object containing title and optional breadcrumbs and tag
 * @returns An object with the merged meta property
 *
 * @example
 * ```ts
 * export async function load(event) {
 *   return {
 *     ...(await addPageMeta(event, { title: 'Applications' })),
 *     // other data...
 *   };
 * }
 * ```
 *
 * @example
 * ```ts
 * export async function load(event) {
 *   return {
 *     ...(await addPageMeta(event, {
 *       title: 'Application Details',
 *       breadcrumbs: [{ label: 'Applications', href: '/team/myteam/applications' }]
 *     })),
 *     // other data...
 *   };
 * }
 * ```
 *
 * @example
 * ```ts
 * export async function load(event) {
 *   return {
 *     ...(await addPageMeta(event, {
 *       title: 'Application Details',
 *       breadcrumbs: [{ label: 'Applications', href: '/team/myteam/applications' }],
 *       tag: { label: 'prod', variant: 'info-moderate' }
 *     })),
 *     // other data...
 *   };
 * }
 * ```
 */
export async function addPageMeta<
	T extends {
		parent: () => Promise<{ meta?: App.LayoutData['meta'] } & Record<string, unknown>>;
	}
>(event: T, options: AddPageMetaOptions) {
	const parentData = await event.parent();
	const { title, breadcrumbs, tag } = options;

	return {
		meta: {
			...parentData.meta,
			...(title ? { title } : {}),
			...(breadcrumbs
				? { breadcrumbs: [...(parentData.meta?.breadcrumbs ?? []), ...breadcrumbs] }
				: {}),
			...(tag ? { tag } : {})
		}
	};
}
