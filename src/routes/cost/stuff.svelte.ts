import { SelectionState } from '@layerstack/svelte-state';
export class HighlightKey {
		current : string | null= $state(null);
		set = (seriesKey : string | null) => {
				this.current = seriesKey;
		};
}
type series = { key: string; value: never; label?: string; data?: {[key: string]: unknown}[]; color?: string; }[];

export class SeriesState {
		#series : series = $state.raw([]);
		selectedSeries = new SelectionState();
		selectedKeys = new SelectionState();
		highlightKey = new HighlightKey();
		constructor(getSeries : () => series) {
				this.#series = getSeries();
				$effect.pre(() => {
						// keep series state in sync with the prop
						this.#series = getSeries();
				});
		}
		get series() {
				return this.#series;
		}
		get isDefaultSeries() {
				return this.#series.length === 1 && this.#series[0].key === 'default';
		}
		get allSeriesData() {
				return this.#series
						.flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
						.filter((d) => d);
		}
		get visibleSeries() {
				return this.#series.filter((s) => this.selectedSeries.isEmpty() || this.selectedSeries.isSelected(s.key));
		}
}
