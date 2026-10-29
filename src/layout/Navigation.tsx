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
	const visibleItemList = itemList.filter(
		(item) =>
			item.capability === undefined ||
			canAccessCapability(permission, item.capability),
	);
	const sectionList = [
		...new Set(visibleItemList.map((item) => item.section ?? "")),
	];
	const currentPath = activePath.split("?", 1)[0] ?? activePath;
	const hasExactActiveItem = visibleItemList.some(
		(item) => item.path === activePath,
	);
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
			<div className="grid gap-4">
				{sectionList.map((section) => (
					<section className="grid gap-1.5" key={section || "default"}>
						{section && (
							<h2
								className="
          m-0 px-3 pt-1 text-caption
          font-bold tracking-[0.08em] text-text-subtle
        "
							>
								{section}
							</h2>
						)}
						<ul
							className="
         m-0 grid list-none gap-1.5
         p-0 max-[720px]:flex max-[720px]:flex-wrap max-[720px]:gap-1
       "
						>
							{visibleItemList
								.filter((item) => (item.section ?? "") === section)
								.map((item) => {
									const itemPath = item.path.split("?", 1)[0] ?? item.path;
									const isActive = hasExactActiveItem
										? item.path === activePath
										: itemPath === currentPath ||
											currentPath.startsWith(`${itemPath}/`);
									return (
										<li key={item.path}>
											<Anchor
												className="
              flex items-center gap-2 rounded-md
              px-3 py-2.5 font-semibold text-text-muted
              no-underline hover:bg-canvas hover:text-text focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-focus aria-[current=page]:bg-primary-soft aria-[current=page]:font-bold
              aria-[current=page]:text-primary-strong
            "
												href={item.path}
												aria-current={isActive ? "page" : undefined}
												onClick={(event) => handleNavigation(event, item.path)}
											>
												{item.icon && (
													<span
														className="inline-flex h-4.5 w-4.5 shrink-0"
														aria-hidden="true"
													>
														{item.icon}
													</span>
												)}
												<span>{item.label}</span>
												{item.badge !== undefined && (
													<span
														className="
                ml-auto rounded-pill bg-surface-muted px-1.5
                py-0.5 text-caption text-text-muted
              "
													>
														{item.badge}
													</span>
												)}
											</Anchor>
										</li>
									);
								})}
						</ul>
					</section>
				))}
			</div>
		</nav>
	);
};
