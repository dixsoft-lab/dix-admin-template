import type { ReactNode } from "react";

export type StatCardProps = {
	readonly label: string;
	readonly value: ReactNode;
	readonly detail?: ReactNode;
	readonly className?: string;
};

export const StatCard = ({
	label,
	value,
	detail,
	className = "",
}: StatCardProps) => (
	<div
		className={`min-h-32 rounded-xl border border-border bg-surface p-6 ${className}`}
	>
		<dl>
			<dt className="text-subtitle font-semibold text-text-muted">{label}</dt>
			<dd className="mt-2 text-metric leading-[1.1] font-bold tabular-nums">
				{value}
			</dd>
		</dl>
		{detail && <p className="mt-2 text-meta text-text-muted">{detail}</p>}
	</div>
);
