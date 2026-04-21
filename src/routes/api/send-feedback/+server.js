import { env } from '$env/dynamic/private';
import { ServerGetUserQuery } from '$lib/urql/queries/serverGetUser';
import { runQuery } from '$lib/urql/load';
import { createFeedbackMessage } from './message';
import { WebClient } from '@slack/web-api';
import { json } from '@sveltejs/kit';

const client = new WebClient(env.SLACK_API_TOKEN);
const channel = env.SLACK_FEEDBACK_CHANNEL_ID || '';
const tenant = env.TENANT_NAME || '';

export async function POST(event) {
	const { request } = event;

	const { data } = await runQuery(event, ServerGetUserQuery, {}, { ignoreAuthErrors: true });
	if (data?.me.__typename !== 'User') {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}
	if (!data?.me.email) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const email = data.me.email;

	const body = await request.json();
	const { anonymous, feedback, path, type } = body;

	let blocks;

	try {
		blocks = createFeedbackMessage(anonymous, email, feedback, path, tenant, type);
	} catch (error) {
		return json({ error: 'Failed to create feedback message - ' + error }, { status: 500 });
	}

	try {
		const result = await client.chat.postMessage({
			channel: channel,
			blocks: blocks,
			text: `${type} feedback`,
			unfurl_links: false,
			unfurl_media: false
		});

		if (result.ok) {
			return json({ message: 'Feedback sent successfully!' });
		} else {
			return json({ error: 'Failed to send feedback' }, { status: 500 });
		}
	} catch (error) {
		return json({ error: 'An error occurred - ' + error }, { status: 500 });
	}
}
