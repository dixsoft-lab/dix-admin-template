import type { ReactNode } from "react";

export type StatCardProps = {
	readonly label: string;
	readonly value: ReactNode;
	readonly detail?: ReactNode;
};

export const StatCard = ({ label, value, detail }: StatCardProps) => (
	<div className="dix-stat-card">
		<dl>
			<dt>{label}</dt>
			<dd>{value}</dd>
		</dl>
		{detail && <p>{detail}</p>}
	</div>
);
