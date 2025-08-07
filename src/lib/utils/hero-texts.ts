import { format } from 'date-fns';

export const heroTemplates = [
	(name: string, date: Date) => `Good ${getGreeting(date)}, ${name}. Let’s dive into the logs.`,
	(name: string, date: Date) => `Happy ${weekday(date)}, ${name}. The services missed you.`,
	(name: string, date: Date) => `It's ${formatDate(date)}. You know what's running, ${name}?`,
	(name: string, date: Date) =>
		`Welcome back, ${name}. ${year(date)} needs your observability skills.`,
	(name: string, date: Date) => `${name}, this ${season(date)} won’t monitor itself.`,
	(name: string, date: Date) =>
		isChristmas(date) ? `God jul, ${name}. Even prod is feeling festive.` : null,
	(name: string, date: Date) =>
		isEaster(date) ? `Happy Easter, ${name}. Watch out for hidden risks (and eggs).` : null,
	(name: string, date: Date) =>
		isMay17(date) ? `Gratulerer med dagen, ${name}! 🇳🇴 Even the logs are celebrating.` : null,
	(name: string) => `Hey ${name}, you know what's running — but do you know what it costs?`,
	(name: string) => `Welcome, ${name}. The risks are lurking. The Console is watching.`,
	(name: string) => `Know what's running, what it costs, and where ${name} just deployed to prod.`,
	(name: string) => `Running? ✅ Costs? ✅ Risks? ✅ ${name}'s got it all covered.`,
	(name: string) => `Console online. ${name}, show us where the risks are.`,
	(name: string) => `Everything's running, ${name}. But at what cost?`,
	(name: string) => `${name}, something’s running. Something’s costing. Something’s risky.`,
	(name: string) => `Hi ${name}! Track what's running, avoid the risks, and keep the CFO happy.`,
	(name: string) => `${name}, you *are* the risk. And we love it.`,
	(name: string) => `${name}, the services are running. So are the costs.`,
	(name: string) => `Know what's running. Know what it costs. Know you're the hero, ${name}.`,
	(name: string) => `${name}, your cluster called. It wants to talk about risk.`,
	(name: string) => `${name}, the truth is in the logs.`,
	(name: string) => `Not all who deploy are lost. Except the expensive ones. Find them, ${name}.`,
	(name: string) => `Welcome back, ${name}. Nothing’s broken… yet.`,
	(name: string) =>
		`${name}, we see your services. All ${Math.floor(Math.random() * 1000) + 1} of them.`,
	(name: string) => `Running. Costing. Risking. Just another Tuesday with ${name}.`,
	(name: string) => `Hello ${name}, we’ve indexed your anxiety logs.`,
	(name: string) => `${name}, you’ve got 99 problems, but Console ain’t one.`,
	(name: string) => `You deploy like a poet, ${name}. Let’s talk cost.`,
	(name: string) => `Hi ${name}, and welcome to your command line with a UI.`,
	(name: string) => `${name}, all systems nominal. Except that one.`,
	(name: string) => `Ready to tame the risk beast, ${name}?`,
	(name: string) => `The Console awaits your wisdom, ${name}.`,
	(name: string) => `We made dashboards so ${name} could sleep again.`,
	(name: string) =>
		`Know what's running. Guess what it costs. Panic when it's risky. (Not you, ${name}, you're chill.)`,
	(name: string) => `${name}, welcome back. The risk is right where you left it.`,
	(name: string) => `${name}, it’s not chaos if you understand it.`,
	(name: string) => `${name}, we track the running. You run the show.`,
	(name: string) => `Hello ${name}, and welcome to “what is using all our money.”`,
	(name: string, today: Date) =>
		`It's ${format(today, 'EEEE')}, ${name}. Let’s make it a low-cost one.`,
	(name: string, today: Date) =>
		`${name}, happy ${format(today, 'EEEE')}. The risks won’t find themselves.`,
	(name: string, today: Date) =>
		`Welcome, ${name}. It’s ${format(today, 'do MMMM')} — the perfect day to track costs.`,
	(name: string, today: Date) =>
		`Another beautiful ${format(today, 'EEEE')}. Another incident waiting, ${name}.`,
	(name: string, today: Date) =>
		`Hey ${name}, it’s ${format(today, 'EEEE')} the ${format(today, 'do')}. Time to check on prod.`,
	(name: string, today: Date) =>
		`${name}, it’s ${format(today, 'EEEE')}. We trust you with the cluster today.`,
	(name: string, today: Date) =>
		`It's ${format(today, 'do MMMM yyyy')}. And yes, something’s on fire. Welcome, ${name}.`,
	(name: string, today: Date) =>
		`Happy ${format(today, 'EEEE')}, ${name}. Let’s not push to prod just yet.`,
	(name: string, today: Date) =>
		`${name}, even the dashboards are sleepy on this ${format(today, 'EEEE')}.`,
	(name: string, today: Date) =>
		`Cost spike scheduled for ${format(today, 'EEEE HH:mm')} — unless you stop it, ${name}.`,
	(name: string, today: Date) =>
		`Logs don’t lie. Especially not on a ${format(today, 'EEEE')}. Go get ‘em, ${name}.`,
	(name: string, today: Date) =>
		`Welcome, ${name}. It’s ${format(today, 'EEEE')}. So, what’s running?`,
	(name: string, today: Date) =>
		`${name}, let’s make this ${format(today, 'EEEE')} count. Preferably in euros.`,
	(name: string, today: Date) =>
		`It’s already ${format(today, 'EEEE HH:mm')}. Time to log in, ${name}.`,
	(name: string, today: Date) =>
		`The platform is holding up — for now. Happy ${format(today, 'EEEE')}, ${name}.`,
	(name: string) =>
		`Happy ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}, ${name}. Or as prod calls it, 'Incident Day'.`,
	(name: string) =>
		`${name}, it’s ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}. The graphs are lying again.`,
	(name: string) =>
		`Welcome to ${new Date().toLocaleDateString('en-US', { month: 'long' })}, ${name}. May your costs be invisible.`,
	(name: string) =>
		`${name}, it's still ${new Date().getFullYear()}. And yes, prod is still weird.`,
	(name: string) => `${name}, it’s ${new Date().getDate()}. Somewhere a cron job just misfired.`,
	(name: string) =>
		`${name}, remember: every ${new Date().toLocaleDateString('en-US', { weekday: 'long' })} is an opportunity to break staging.`,
	(name: string) =>
		`${name}, it's ${new Date().toLocaleDateString('en-US', { weekday: 'long' })} — let's pretend we understand those charts.`,
	(name: string) =>
		`Another ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}, another undefined cost. Welcome, ${name}.`,
	(name: string) => `${name}, you survived Monday. Now survive this dashboard.`,
	(name: string) => `${name}, happy almost-weekend. Unless you’re on call.`,
	(name: string) =>
		`It’s ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}, ${name}. Time to deploy and deny.`,
	(name: string) =>
		`Hi ${name}, welcome to the ${new Date().toLocaleDateString('en-US', { weekday: 'long' })} panic parade.`,
	(name: string) => `${name}, did you know it's ${new Date().getDate()} days into this chaos?`,
	(name: string) =>
		`Good luck, ${name}. It’s ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}, and the alerts know it.`,
	(name: string) =>
		`${name}, it’s ${new Date().toLocaleDateString('en-US', { month: 'long' })}. Just blame the weather for that latency.`,
	(name: string) =>
		`Welcome to your ${new Date().toLocaleDateString('en-US', { weekday: 'long' })} reality, ${name}. Risky and slightly on fire.`,
	(name: string) =>
		`${name}, it’s still cheaper than last ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}. Barely.`,
	(name: string) =>
		`Who needs coffee, ${name}? It’s ${new Date().toLocaleDateString('en-US', { weekday: 'long' })} and your pods are pending.`,
	(name: string) =>
		`${name}, it’s ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}. The logs are spicy today.`,
	(name: string) => `${name}, it's the ${new Date().getDate()}th again. We’re so sorry.`
];

export function pickHeroText(name: string): string {
	const date = new Date();
	const validTemplates = heroTemplates
		.map((fn) => fn(name, date))
		.filter((txt): txt is string => !!txt);
	const randomIndex = Math.floor(Math.random() * validTemplates.length);
	return validTemplates[randomIndex];
}

function weekday(date: Date) {
	return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function formatDate(date: Date) {
	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long'
	});
}

function year(date: Date) {
	return date.getFullYear();
}

function getGreeting(date: Date) {
	const hour = date.getHours();
	if (hour < 12) return 'morning';
	if (hour < 18) return 'afternoon';
	return 'evening';
}

function season(date: Date): 'winter' | 'spring' | 'summer' | 'autumn' {
	const m = date.getMonth();
	if (m <= 1 || m === 11) return 'winter';
	if (m >= 2 && m <= 4) return 'spring';
	if (m >= 5 && m <= 7) return 'summer';
	return 'autumn';
}

function isChristmas(date: Date): boolean {
	return date.getMonth() === 11 && date.getDate() >= 20 && date.getDate() <= 26;
}

function isMay17(date: Date): boolean {
	return date.getMonth() === 4 && date.getDate() === 17;
}

function isEaster(date: Date): boolean {
	const year = date.getFullYear();
	const easter = calcEaster(year);
	const diff = Math.abs(+date - +easter) / (1000 * 60 * 60 * 24);
	return diff <= 7;
}

function calcEaster(y: number): Date {
	const a = y % 19;
	const b = Math.floor(y / 100);
	const c = y % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
	const day = ((h + l - 7 * m + 114) % 31) + 1;
	return new Date(y, month, day);
}
