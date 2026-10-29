export type BarTone =
	"primary" | "secondary" | "positive" | "negative" | "muted";

export type BarChartItem = {
	readonly id: string;
	readonly label: string;
	readonly value: number;
	readonly displayValue?: string;
	readonly ariaLabel?: string;
	readonly tone?: BarTone;
};

export type BarValueFormatter = (value: number, item: BarChartItem) => string;

export const barToneClassName = {
	primary: "bg-primary-strong",
	secondary: "bg-primary-strong/70",
	positive: "bg-positive",
	negative: "bg-negative",
	muted: "bg-border-strong",
} as const satisfies Record<BarTone, string>;

export const resolveBarScale = (value: number, maxValue: number) => {
	const normalizedMax =
		Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 1;
	const normalizedValue = Number.isFinite(value)
		? Math.max(0, Math.min(normalizedMax, value))
		: 0;

	return {
		maxValue: normalizedMax,
		value: normalizedValue,
		percent: (normalizedValue / normalizedMax) * 100,
	};
};
