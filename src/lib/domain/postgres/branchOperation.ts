export async function branchOperation<T>({
	request,
	accepted,
	successMessage,
	rejectedMessage,
	refresh
}: {
	request: () => Promise<{ data?: T | null; errors?: readonly { message: string }[] | null }>;
	accepted: (data: T) => boolean;
	successMessage: string;
	rejectedMessage: string;
	refresh: () => Promise<void>;
}) {
	let result;
	try {
		result = await request();
	} catch {
		return {
			ok: false,
			message:
				'The request could not be confirmed. Check branch status before trying again; the operation may have been accepted.'
		};
	}
	if (result.errors?.length) {
		return { ok: false, message: result.errors.map((error) => error.message).join('. ') };
	}
	if (!result.data || !accepted(result.data)) {
		return { ok: false, message: rejectedMessage };
	}
	try {
		await refresh();
	} catch {
		return {
			ok: true,
			message: `${successMessage} Status could not be refreshed. Check branch status before requesting the operation again.`
		};
	}
	return { ok: true, message: successMessage };
}
