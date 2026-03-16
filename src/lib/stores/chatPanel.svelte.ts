import { browser } from '$app/environment';

const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 300;
const MAX_WIDTH = 800;
const STORAGE_KEY = 'chatPanelWidth';
const STORAGE_KEY_OPEN = 'chatPanelOpen';

class ChatPanelState {
	isOpen = $state(false);
	width = $state(DEFAULT_WIDTH);

	readonly minWidth = MIN_WIDTH;
	readonly maxWidth = MAX_WIDTH;

	constructor() {
		if (browser) {
			const storedWidth = localStorage.getItem(STORAGE_KEY);
			if (storedWidth) {
				const parsed = parseInt(storedWidth, 10);
				if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
					this.width = parsed;
				}
			}
			const storedOpen = localStorage.getItem(STORAGE_KEY_OPEN);
			if (storedOpen !== null) {
				this.isOpen = storedOpen === 'true';
			}
		}
	}

	open() {
		this.isOpen = true;
		if (browser) {
			localStorage.setItem(STORAGE_KEY_OPEN, 'true');
		}
	}

	close() {
		this.isOpen = false;
		if (browser) {
			localStorage.setItem(STORAGE_KEY_OPEN, 'false');
		}
	}

	toggle() {
		this.isOpen = !this.isOpen;
		if (browser) {
			localStorage.setItem(STORAGE_KEY_OPEN, String(this.isOpen));
		}
	}

	setWidth(width: number) {
		this.width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
		if (browser) {
			localStorage.setItem(STORAGE_KEY, String(this.width));
		}
	}
}

export const chatPanel = new ChatPanelState();
