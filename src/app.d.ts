// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			tenantName: string;
			githubOrganization: string;
		}
		// interface PageData {}
		// interface Platform {}
		interface PageState {
			modalHref?: string;
		}
	}
}

export {};
