import {
	barToneClassName,
	resolveBarScale,
	type BarTone,
} from "./bar-chart-contract";

export type HorizontalBarProps = {
	readonly label: string;
	readonly value: number;
	readonly maxValue?: number;
	readonly valueText?: string;
	readonly tone?: BarTone;
	readonly size?: "sm" | "md";
	readonly trackWidth?: number | string;
	readonly className?: string;
};

const sizeClassName = {
	sm: "h-2",
	md: "h-2.5",
} as const;

export const HorizontalBar = ({
	label,
	value,
	maxValue = 100,
	valueText,
	tone = "primary",
	size = "md",
	trackWidth = "100%",
	className,
}: HorizontalBarProps) => {
	const scale = resolveBarScale(value, maxValue);

	return (
		<div
			className={`
     block shrink-0 overflow-hidden rounded-pill
     bg-surface-muted
     ${sizeClassName[size]} ${className ?? ""}`}
			style={{ width: trackWidth }}
			role="progressbar"
			aria-label={label}
			aria-valuemin={0}
			aria-valuemax={scale.maxValue}
			aria-valuenow={scale.value}
			aria-valuetext={valueText}
		>
			<span
				className={`block h-full rounded-pill ${barToneClassName[tone]}`}
				style={{ width: `${scale.percent}%` }}
			/>
		</div>
	);
};
