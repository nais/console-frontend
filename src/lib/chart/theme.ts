import type { ThemeOption } from 'echarts/types/src/util/types.js';

import { visualizationColors } from '$lib/visualizationColors';
import {
	BorderNeutral,
	BorderNeutralSubtle,
	Neutral1000,
	TextNeutralContrast,
	TextNeutralSubtle
} from '@navikt/ds-tokens/darkside-js';

type rootEcharts = typeof import('echarts');

const rootTheme: ThemeOption = {
	color: visualizationColors,

	visualMap: {
		color: ['#02151a', '#a2d4e6']
	},
	backgroundColor: 'none',
	textStyle: {},
	title: {
		textStyle: {
			color: TextNeutralSubtle
		},
		subtextStyle: {
			color: TextNeutralContrast
		}
	},
	line: {
		itemStyle: {
			borderWidth: 4
		},
		symbolSize: 0,
		symbol: 'circle',
		smooth: false
	},
	bar: {
		itemStyle: {
			barBorderWidth: 0,
			barBorderColor: BorderNeutralSubtle
		}
	},
	pie: {
		itemStyle: {
			borderWidth: 0,
			borderColor: BorderNeutralSubtle
		}
	},
	graph: {
		itemStyle: {
			borderWidth: 0,
			borderColor: BorderNeutralSubtle
		},
		lineStyle: {
			width: 1,
			color: Neutral1000
		},
		symbolSize: 0,
		symbol: 'circle',
		smooth: true,
		color: ['#3386e0', '#005b82', '#c77300', '#368da8', '#33aa5f', '#8269a2'],
		label: {
			color: Neutral1000
		}
	},
	categoryAxis: {
		axisLine: {
			show: true,
			lineStyle: {
				color: BorderNeutral
			}
		},
		axisTick: {
			show: false,
			lineStyle: {
				color: '#333'
			}
		},
		axisLabel: {
			show: true,
			color: '#aaaaaa'
		},
		splitLine: {
			show: false,
			lineStyle: {
				color: ['#e6e6e6']
			}
		},
		splitArea: {
			show: false,
			areaStyle: {
				color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)']
			}
		}
	},
	valueAxis: {
		axisLine: {
			show: true,
			lineStyle: {
				color: BorderNeutral
			}
		},
		axisTick: {
			show: false,
			lineStyle: {
				color: '#333'
			}
		},
		axisLabel: {
			show: true,
			color: '#aaaaaa'
		},
		splitLine: {
			show: false,
			lineStyle: {
				color: ['#e6e6e6']
			}
		},
		splitArea: {
			show: false,
			areaStyle: {
				color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)']
			}
		}
	},
	logAxis: {
		axisLine: {
			show: true,
			lineStyle: {
				color: BorderNeutral
			}
		},
		axisTick: {
			show: false,
			lineStyle: {
				color: '#333'
			}
		},
		axisLabel: {
			show: true,
			color: '#aaaaaa'
		},
		splitLine: {
			show: false,
			lineStyle: {
				color: ['#e6e6e6']
			}
		},
		splitArea: {
			show: false,
			areaStyle: {
				color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)']
			}
		}
	},
	timeAxis: {
		axisLine: {
			show: true,
			lineStyle: {
				color: BorderNeutral
			}
		},
		axisTick: {
			show: false,
			lineStyle: {
				color: '#333'
			}
		},
		axisLabel: {
			show: true,
			color: '#aaaaaa'
		},
		splitLine: {
			show: false,
			lineStyle: {
				color: ['#e6e6e6']
			}
		},
		splitArea: {
			show: false,
			areaStyle: {
				color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)']
			}
		}
	},
	toolbox: {
		iconStyle: {
			borderColor: TextNeutralSubtle
		},
		emphasis: {
			iconStyle: {
				borderColor: BorderNeutral
			}
		}
	},
	legend: {
		textStyle: {
			color: TextNeutralSubtle
		}
	},
	tooltip: {
		axisPointer: {
			lineStyle: {
				color: BorderNeutralSubtle,
				width: 1
			},
			crossStyle: {
				color: BorderNeutralSubtle,
				width: 1
			}
		},
		backgroundColor: 'var(--ax-bg-raised)',
		borderColor: BorderNeutral
	},
	dataZoom: {
		backgroundColor: 'rgba(255,255,255,0)',
		dataBackgroundColor: 'rgba(114,204,255,1)',
		fillerColor: 'rgba(114,204,255,0.2)',
		handleColor: '#72ccff',
		handleSize: '100%',
		textStyle: {
			color: '#333333'
		}
	},
	markPoint: {
		label: {
			color: Neutral1000
		},
		emphasis: {
			label: {
				color: Neutral1000
			}
		}
	}
};

let registered = false;
export function registerTheme(echarts: rootEcharts) {
	if (registered) {
		return;
	}
	registered = true;

	echarts.registerTheme('aksel', {
		...rootTheme
	});
}
