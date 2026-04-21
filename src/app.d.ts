// See https://kit.svelte.dev/docs/types#app

import type { RouteId } from '$app/types';
import type { UrqlContext } from '$lib/urql/client';
import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			docPath?: string;
		}
		interface Locals {
			tenantName: string;
			githubOrganization: string;
			/**
			 * Per-request urql client and SSR exchange.
			 *
			 * Created in `hooks.server.ts` so that all `load` functions for a single
			 * SvelteKit request share one normalized cache and one SSR exchange,
			 * which is then serialized to the browser by `+layout.server.ts`.
			 */
			urql: UrqlContext;
		}
		interface PageData {
			meta: {
				title: string;
				breadcrumbs?: { label: string; href?: RouteId }[];
				tag?: {
					label: string;
					variant: TagProps['variant'];
				};
			};
		}
		interface LayoutData {
			meta: {
				title?: string;
				breadcrumbs?: { label: string; href?: RouteId }[];
				tag?: {
					label: string;
					variant: TagProps['variant'];
				};
			};
		}
		// interface Platform {}
		interface PageState {
			modalHref?: string;
		}
	}
}

export {};
