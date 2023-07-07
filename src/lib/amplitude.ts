import { browser, dev } from '$app/environment';
import { page } from '$app/stores';
import amplitude from 'amplitude-js';
import { get } from 'svelte/store';

const getApiKey = () => {
	if (dev) {
		return '04203d48401492bda4620a74acf85a5b'; // dev
	}
	return '16d1ee2fd894ca2562eeebb5095dbcf0'; // prod
};

const instance = amplitude.getInstance();

type Events = 'pageview' | 'search';

export const logEvent = (event: Events, properties?: object) => {
	if (!browser) return;

	const eventDataDefault = {
		routeID: get(page).route.id,
		domain: window.location.host,
		service: 'nais-console'
	};

	if (dev) console.debug('amplitudeLogEvent', event, properties);

	instance.logEvent(event, { ...eventDataDefault, ...properties });
};

if (browser) {
	instance.init(getApiKey(), undefined, {
		apiEndpoint: 'amplitude.nav.no/collect',
		saveEvents: false,
		includeUtm: true,
		batchEvents: true,
		includeReferrer: true,
		trackingOptions: {
			city: false,
			ip_address: false,
			carrier: false
		}
	});
}
