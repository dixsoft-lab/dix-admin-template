import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { useHref, useInRouterContext } from "react-router-dom";
import { canAccessCapability } from "@/contract/authorization/permission-adapter";
import type { PermissionAdapter } from "@/contract/authorization/permission-adapter";
import type {
	Navigate,
	NavigationItem,
} from "@/contract/navigation/navigation-contract";

type NavigationProps = {
	readonly itemList: readonly NavigationItem[];
	readonly permission: PermissionAdapter;
	readonly activePath: string;
	readonly onNavigate?: Navigate;
};

type NavigationAnchorProps = ComponentPropsWithoutRef<"a"> & {
	readonly href: string;
};
const RouterAnchor = ({ href, ...prop }: NavigationAnchorProps) => {
	const resolvedHref = useHref(href);
	return <a {...prop} href={resolvedHref} />;
};

export const Navigation = ({
	itemList,
	permission,
	activePath,
	onNavigate,
}: NavigationProps) => {
	const Anchor = useInRouterContext() ? RouterAnchor : "a";
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
		<nav className="py-5 max-[720px]:py-0" aria-label="관리 메뉴">
			<ul className="m-0 grid list-none gap-1.5 p-0 max-[720px]:flex max-[720px]:flex-wrap max-[720px]:gap-1">
				{itemList.map((item) => {
					if (
						item.capability !== undefined &&
						!canAccessCapability(permission, item.capability)
					)
						return null;
					return (
						<li key={item.path}>
							<Anchor
								className="flex items-center gap-2 rounded-md px-3 py-2.5 font-semibold text-text-muted no-underline hover:bg-canvas hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[current=page]:bg-primary-soft aria-[current=page]:font-bold aria-[current=page]:text-primary-strong"
								href={item.path}
								aria-current={item.path === activePath ? "page" : undefined}
								onClick={(event) => handleNavigation(event, item.path)}
							>
								{item.icon && (
									<span
										className="inline-flex h-[18px] w-[18px] shrink-0"
										aria-hidden="true"
									>
										{item.icon}
									</span>
								)}
								<span>{item.label}</span>
								{item.badge !== undefined && (
									<span className="ml-auto rounded-pill bg-surface-muted px-1.5 py-0.5 text-caption text-text-muted">
										{item.badge}
									</span>
								)}
							</Anchor>
						</li>
					);
				})}
			</ul>
		</nav>
	);
};
