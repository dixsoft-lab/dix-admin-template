import { useId, type ReactNode } from "react";
import { VerticalBar } from "./VerticalBar";
import type { BarChartItem, BarValueFormatter } from "./bar-chart-contract";

export type VerticalBarChartProps = {
	readonly title: string;
	readonly itemList: readonly BarChartItem[];
	readonly maxValue?: number;
	readonly valueFormatter?: BarValueFormatter;
	readonly headerMeta?: ReactNode;
	readonly footer?: ReactNode;
	readonly className?: string;
};

export const VerticalBarChart = ({
	title,
	itemList,
	maxValue = 100,
	valueFormatter,
	headerMeta,
	footer,
	className,
}: VerticalBarChartProps) => {
	const titleId = useId();
	const chartLabel = `${title} 그래프`;
	const formatValue = (item: BarChartItem) =>
		item.displayValue ??
		valueFormatter?.(item.value, item) ??
		String(item.value);
	const summary = itemList.map(formatValue).join(" · ");

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
				<h2
					className="m-0 text-subtitle font-semibold tracking-[-0.02em]"
					id={titleId}
				>
					{title}
				</h2>
				{headerMeta && (
					<div className="shrink-0 text-caption text-text-subtle">
						{headerMeta}
					</div>
				)}
			</header>
			<div className="px-5 pt-4 pb-3">
				<div
					className="
       flex min-h-46 items-end justify-around
       gap-3 border-b border-border px-4
       pt-5
     "
					role="list"
					aria-label={chartLabel}
				>
					{itemList.map((item) => (
						<div
							className="
         flex h-41 flex-1 flex-col
         items-center justify-end gap-2 text-[11px]
         text-text-muted
       "
							key={item.id}
							role="listitem"
						>
							<VerticalBar
								label={item.ariaLabel ?? `${item.label} ${title}`}
								value={item.value}
								maxValue={maxValue}
								valueText={formatValue(item)}
								tone={item.tone}
								width="min(48px, 55%)"
							/>
							<small>{item.label}</small>
						</div>
					))}
				</div>
				<p className="mt-3 mb-0 text-meta text-text-subtle">
					{footer ?? summary}
				</p>
			</div>
		</section>
	);
};
