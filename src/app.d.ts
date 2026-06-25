// See https://kit.svelte.dev/docs/types#app

import type { RouteId } from '$app/types';
import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';

// for information about these interfaces
declare global {
	interface SporingPayload {
		hostname?: string;
		language?: string;
		referrer?: string;
		screen?: string;
		title?: string;
		url?: string;
		website?: string;
		name?: string;
		data?: Record<string, string | number | boolean>;
	}

	interface Sporing {
		track(): void;
		track(eventName: string): void;
		track(eventName: string, data: Record<string, string | number | boolean>): void;
		track(payload: SporingPayload): void;
		track(callback: (payload: SporingPayload) => SporingPayload): void;
		identify(uniqueId: string): void;
		identify(uniqueId: string, data: Record<string, string | number | boolean>): void;
	}

	interface Window {
		sporing?: Sporing;
		beforeSend?: (type: string, payload: SporingPayload) => SporingPayload | null;
		__sporingRouteId?: string;
	}

	namespace App {
		interface Error {
			docPath?: string;
		}
		interface Locals {
			tenantName: string;
			githubOrganization: string;
			trackingEnabled: boolean;
			trackingWebsiteId: string;
			trackingDev: boolean;
		}
		interface PageData {
			meta: {
				title: string;
				pageHeaderTitle?: string;
				breadcrumbs?: { label: string; href?: RouteId }[];
				tag?: {
					label: string;
					variant: TagProps['variant'];
				};
				docPath?: string;
			};
		}
		interface LayoutData {
			meta: {
				title?: string;
				pageHeaderTitle?: string;
				breadcrumbs?: { label: string; href?: RouteId }[];
				tag?: {
					label: string;
					variant: TagProps['variant'];
				};
				docPath?: string;
			};
		}
		// interface Platform {}
		interface PageState {
			modalHref?: string;
			showMessage?: { id: string; type: 'success' | 'error'; text: string; target?: string }[];
		}
	}
}

export {};
