import { createContext } from 'svelte';

interface ActivityMetaContext {
	showTeam: () => boolean;
	teamSlug: () => string | null | undefined;
	resourceType: () => string;
}

const [getActivityMetaContext, setActivityMetaContext, hasActivityMetaContext] =
	createContext<ActivityMetaContext>();

export function getOptionalActivityMetaContext(): ActivityMetaContext | undefined {
	return hasActivityMetaContext() ? getActivityMetaContext() : undefined;
}

export { setActivityMetaContext };
