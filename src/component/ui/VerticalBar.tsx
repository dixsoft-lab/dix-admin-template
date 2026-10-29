import {
	type BarTone,
	barToneClassName,
	resolveBarScale,
} from "./bar-chart-contract";

export type VerticalBarProps = {
	readonly label: string;
	readonly value: number;
	readonly maxValue?: number;
	readonly valueText?: string;
	readonly tone?: BarTone;
	readonly size?: "sm" | "md" | "lg";
	readonly width?: number | string;
	readonly height?: number | string;
	readonly className?: string;
};

const sizeStyle = {
	sm: { width: 24, height: 96 },
	md: { width: 32, height: 144 },
	lg: { width: 40, height: 192 },
} as const;

export const VerticalBar = ({
	label,
	value,
	maxValue = 100,
	valueText,
	tone = "primary",
	size = "md",
	width,
	height,
	className,
}: VerticalBarProps) => {
	const scale = resolveBarScale(value, maxValue);

	return (
		<div
			className={`
     flex shrink-0 items-end justify-center
     overflow-hidden
     ${className ?? ""}`}
			style={{
				width: width ?? sizeStyle[size].width,
				height: height ?? sizeStyle[size].height,
			}}
			role="progressbar"
			aria-label={label}
			aria-valuemin={0}
			aria-valuemax={scale.maxValue}
			aria-valuenow={scale.value}
			aria-valuetext={valueText}
		>
			<span
				className={`block min-h-0.5 w-full rounded-t-sm ${barToneClassName[tone]}`}
				style={{ height: `${scale.percent}%` }}
			/>
		</div>
	);
};
