import { deleteWebhook, enableWebhook } from '#lib/domain/webhooks/actions.server.js';
import type { Actions } from './$types';

export const actions = { delete: deleteWebhook, enable: enableWebhook } satisfies Actions;
