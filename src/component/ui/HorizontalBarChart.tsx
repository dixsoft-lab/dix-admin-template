import { type ReactNode, useId } from "react";

import type { BarChartItem, BarValueFormatter } from "./bar-chart-contract";
import { HorizontalBar } from "./HorizontalBar";

export type HorizontalBarChartProps = {
	readonly title: string;
	readonly itemList: readonly BarChartItem[];
	readonly maxValue?: number;
	readonly valueFormatter?: BarValueFormatter;
	readonly headerMeta?: ReactNode;
	readonly headerAction?: ReactNode;
	readonly className?: string;
};

export const HorizontalBarChart = ({
	title,
	itemList,
	maxValue = 100,
	valueFormatter,
	headerMeta,
	headerAction,
	className,
}: HorizontalBarChartProps) => {
	const titleId = useId();
	const chartLabel = `${title} 그래프`;
	const formatValue = (item: BarChartItem) =>
		item.displayValue ??
		valueFormatter?.(item.value, item) ??
		String(item.value);

	return (
		<section
			className={`
     min-w-0 overflow-hidden rounded-xl border
     border-border bg-surface
     ${className ?? ""}`}
			aria-labelledby={titleId}
		>
			<header
				className="
      flex min-h-14 items-center justify-between
      gap-3 border-b border-border px-5
      py-2.5 max-[720px]:items-start max-[720px]:flex-col
    "
			>
				<div
					className="
       flex min-w-0 flex-wrap items-center
       gap-2
     "
				>
					<h2
						className="m-0 text-subtitle font-semibold tracking-[-0.02em]"
						id={titleId}
					>
						{title}
					</h2>
					{headerMeta}
				</div>
				{headerAction && (
					<div className="shrink-0 text-meta font-semibold text-text">
						{headerAction}
					</div>
				)}
			</header>
			<div className="grid gap-5 p-5">
				<div className="grid gap-5" role="list" aria-label={chartLabel}>
					{itemList.map((item) => (
						<div
							className="
         grid grid-cols-[120px_minmax(0,1fr)_100px] items-center gap-3
         text-meta max-[720px]:grid-cols-[56px_minmax(24px,1fr)_max-content] max-[720px]:gap-2
       "
							key={item.id}
							role="listitem"
						>
							<span className="truncate">{item.label}</span>
							<HorizontalBar
								label={item.ariaLabel ?? `${item.label} ${title}`}
								value={item.value}
								maxValue={maxValue}
								valueText={formatValue(item)}
								tone={item.tone}
								className="min-w-0"
							/>
							<strong className="whitespace-nowrap text-right tabular-nums">
								{formatValue(item)}
							</strong>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
