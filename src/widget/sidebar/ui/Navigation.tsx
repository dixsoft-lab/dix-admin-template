import type { MouseEvent } from "react";
import { canAccessCapability } from "@admin/entity/current-account";
import type { PermissionAdapter } from "@admin/entity/current-account";
import type { Navigate, NavigationItem } from "../model/sidebar-contract";

type NavigationProps = {
	readonly itemList: readonly NavigationItem[];
	readonly permission: PermissionAdapter;
	readonly activePath: string;
	readonly onNavigate?: Navigate;
};

export const Navigation = ({
	itemList,
	permission,
	activePath,
	onNavigate,
}: NavigationProps) => {
	const handleNavigation = (
		event: MouseEvent<HTMLAnchorElement>,
		path: string,
	) => {
		if (!onNavigate || event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
			return;
		event.preventDefault();
		onNavigate(path);
	};

	return (
		<nav className="dix-admin-navigation" aria-label="관리 메뉴">
			<ul>
				{itemList.map((item) => {
					if (
						item.capability !== undefined &&
						!canAccessCapability(permission, item.capability)
					)
						return null;
					return (
						<li key={item.path}>
							<a
								href={item.path}
								aria-current={item.path === activePath ? "page" : undefined}
								onClick={(event) => handleNavigation(event, item.path)}
							>
								{item.icon && (
									<span
										className="dix-admin-navigation-icon"
										aria-hidden="true"
									>
										{item.icon}
									</span>
								)}
								<span>{item.label}</span>
								{item.badge !== undefined && (
									<span className="dix-admin-navigation-badge">
										{item.badge}
									</span>
								)}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
};
