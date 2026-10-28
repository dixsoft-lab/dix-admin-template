import type { BreadcrumbValue } from "./breadcrumb-context";

export const Breadcrumb = ({ state, renderLink }: BreadcrumbValue) => {
	const link = (to: string, label: string) => {
		if (renderLink) return renderLink({ to, label });
		return <a href={to}>{label}</a>;
	};
	switch (state.kind) {
		case "back":
			return (
				<nav className="dix-breadcrumb" aria-label="상위 화면">
					{link(state.to, "← " + state.label)}
				</nav>
			);
		case "trail":
			return (
				<nav className="dix-breadcrumb" aria-label="현재 위치">
					<ol>
						{state.itemList.map((item, index) => (
							<li
								key={item.to ?? item.label}
								aria-current={
									index === state.itemList.length - 1 ? "page" : undefined
								}
							>
								{index > 0 && <span aria-hidden="true"> / </span>}
								{item.to ? link(item.to, item.label) : item.label}
							</li>
						))}
					</ol>
				</nav>
			);
		default: {
			const unreachable: never = state;
			return unreachable;
		}
	}
};
