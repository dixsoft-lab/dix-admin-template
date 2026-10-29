import type { ReactNode } from "react";

export type StatCardProps = {
	readonly label: string;
	readonly value: ReactNode;
	readonly icon?: ReactNode;
	readonly detail?: ReactNode;
	readonly className?: string;
};

export const StatCard = ({
	label,
	value,
	icon,
	detail,
	className = "",
}: StatCardProps) => (
	<div
		className={`
    min-h-32 rounded-xl border border-border
    bg-surface p-6
    ${className}`}
	>
		<dl>
			<dt className="text-subtitle font-medium text-text-muted">{label}</dt>
			<dd
				className={`
      mt-2 text-metric leading-[1.1] font-(family-name:--font-num)
      font-semibold tabular-nums
      ${icon ? "flex items-center gap-4" : ""}
				`}
			>
				{icon && (
					<span
						className="
        grid size-12 shrink-0 place-items-center
        rounded-full bg-surface-muted text-primary-strong
      "
						aria-hidden="true"
					>
						{icon}
					</span>
				)}
				<span className={icon ? "inline-flex text-3xl" : ""}>{value}</span>
			</dd>
		</dl>
		{detail && <p className="mt-2 text-meta text-text-muted">{detail}</p>}
	</div>
);
