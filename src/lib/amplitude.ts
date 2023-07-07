import { browser, dev } from '$app/environment';
import { afterNavigate } from '$app/navigation';
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

// This hurts ...
type Events = 'sidevisning' | 'søk';

export const logEvent = (event: Events, properties?: object) => {
	if (!browser) return;

	const eventDataDefault = {
		sidetittel: get(page).route.id,
		domene: window.location.host,
		tjeneste: 'nais-console'
	};

	if (dev) console.debug('amplitudeLogEvent', event, properties);

	instance.logEvent(event, { ...eventDataDefault, ...properties });
};

if (browser) {
	instance.init(getApiKey(), '', {
		apiEndpoint: 'amplitude.nav.no/collect',
		saveEvents: false,
		includeUtm: true,
		batchEvents: true,
		includeReferrer: true,
		platform: window.location.toString(),
		trackingOptions: {
			city: false,
			ip_address: false,
			carrier: false
		}
	});

	afterNavigate((nav) => {
		let props = {};
		if (nav.to?.route.id != null) {
			props = { sidetittel: nav.to.route.id };
		}
		logEvent('sidevisning', props);
	});
}
