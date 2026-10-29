import type { ReactNode } from "react";

export type SectionRailItem = {
	readonly id: string;
	readonly label: string;
	readonly state?: ReactNode;
};

export type SectionRailProps = {
	readonly id?: string;
	readonly label: string;
	readonly itemList: readonly SectionRailItem[];
	readonly activeId: string;
	readonly onSelect: (id: string) => void;
	readonly className?: string;
};

export const SectionRail = ({
	id,
	label,
	itemList,
	activeId,
	onSelect,
	className = "",
}: SectionRailProps) => (
	<nav
		id={id}
		aria-label={label}
		className={`
    min-w-0 [&_ul]:m-0 [&_ul]:grid [&_ul]:list-none
    [&_ul]:gap-0.5 [&_ul]:p-0
    ${className}`}
	>
		<ul>
			{itemList.map((item) => {
				const isActive = item.id === activeId;
				return (
					<li
						className={`
        flex items-center gap-2 rounded-md
        text-body font-semibold
        ${isActive ? "bg-primary text-on-primary" : "text-text-muted"}`}
						key={item.id}
					>
						<button
							aria-controls={item.id}
							aria-current={isActive ? "location" : undefined}
							className={`
         flex w-full cursor-pointer items-center
         gap-2 rounded-md border-0 bg-transparent
         px-3 py-2.5 text-left font-inherit
         text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
         ${isActive ? "font-bold" : "hover:bg-canvas hover:text-text"}`}
							type="button"
							onClick={() => onSelect(item.id)}
						>
							<span className="min-w-0 flex-1">{item.label}</span>
							{item.state !== undefined && (
								<span
									className={`shrink-0 text-caption font-semibold ${isActive ? "text-white/75" : "text-text-subtle"}`}
								>
									{item.state}
								</span>
							)}
						</button>
					</li>
				);
			})}
		</ul>
	</nav>
);
