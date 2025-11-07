// See https://kit.svelte.dev/docs/types#app

import type { RouteId } from '$app/types';
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
