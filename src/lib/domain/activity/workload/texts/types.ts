export type WorkloadActivityEntry<T extends string = string> = {
	__typename: T;
	actor: string;
	createdAt: Date;
	message?: string;
	appScaled?: { newSize?: number; direction?: string };
	applicationUpdated?: { changedFields?: { field: string | null | undefined }[] };
	jobRunDeleted?: { runName?: string };
	jobUpdated?: { changedFields?: { field: string | null | undefined }[] };
	deploymentData?: { triggerURL?: string };
	resourceType?: string;
	teamSlug?: string;
	environmentName?: string;
	resourceName?: string;
};
