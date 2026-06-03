import { load_Secret } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { get } from 'svelte/store';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function load(event) {
	const MAX_RETRIES = 5;
	const RETRY_DELAY = 1500;

	const meta = await addPageMeta(event, {
		title: event.params.secret,
		docPath: '/services/secrets/'
	});

	const variables = {
		team: event.params.team,
		env: event.params.env,
		secret: event.params.secret
	};

	const secretName = event.params.secret.toLowerCase();
	for (let i = 0; i < MAX_RETRIES; i++) {
		const result = await load_Secret({ event, variables, blocking: true });
		const { errors } = get(result.Secret);
		const isSecretNotFound = errors?.some(
			(e) =>
				e.message.toLowerCase().includes('not found') &&
				e.message.toLowerCase().includes(secretName)
		);
		if (!isSecretNotFound || i === MAX_RETRIES - 1) {
			return { ...meta, ...result };
		}
		await sleep(RETRY_DELAY);
	}
}
