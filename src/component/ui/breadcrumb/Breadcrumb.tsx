import type { BreadcrumbValue } from "./breadcrumb-context";

export const Breadcrumb = ({ state, renderLink }: BreadcrumbValue) => {
	const link = (to: string, label: string) => {
		if (renderLink) return renderLink({ to, label });
		return <a href={to}>{label}</a>;
	};
	switch (state.kind) {
		case "back":
			return (
				<nav className="mb-2 text-meta text-text-muted" aria-label="상위 화면">
					{link(state.to, "← " + state.label)}
				</nav>
			);
		case "trail":
			return (
				<nav className="mb-2 text-meta text-text-muted" aria-label="현재 위치">
					<ol
						className="
        m-0 flex list-none flex-wrap
        gap-2 p-0
      "
					>
						{state.itemList.map((item, index) => (
							<li
								key={item.to ?? item.label}
								aria-current={
									index === state.itemList.length - 1 ? "page" : undefined
								}
							>
								{index > 0 && <span aria-hidden="true"> / </span>}
								{item.to ? (
									link(item.to, item.label)
								) : (
									<span className="font-semibold text-text">{item.label}</span>
								)}
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
