import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { Link, useInRouterContext } from "react-router-dom";

import { syncBrandFavicon } from "@/component/metadata/brand-favicon";
import { Button } from "@/component/ui/Button";
import type { AuthenticatedUser } from "@/contract/authentication/authenticated-user";
import type { PermissionAdapter } from "@/contract/authorization/permission-adapter";
import type {
	Brand,
	Navigate,
	NavigationItem,
} from "@/contract/navigation/navigation-contract";

import { Navigation } from "./Navigation";

type BrandHomeLinkProps = {
	readonly homePath: string;
	readonly onNavigate?: Navigate;
	readonly children: ReactNode;
};

const BrandHomeLink = ({
	homePath,
	onNavigate,
	children,
}: BrandHomeLinkProps) => {
	const hasRouterContext = useInRouterContext();
	const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
		if (!onNavigate || event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
			return;
		event.preventDefault();
		onNavigate(homePath);
	};
	const className = `
   flex w-full cursor-pointer items-center
   gap-2 rounded-sm border-b border-border
   px-2 pb-5 font-bold text-text
   no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
 `;

	if (hasRouterContext)
		return (
			<Link className={className} to={homePath} onClick={handleClick}>
				{children}
			</Link>
		);
	return (
		<a className={className} href={homePath} onClick={handleClick}>
			{children}
		</a>
	);
};

type SidebarProps = {
	readonly brand: Brand;
	readonly user: AuthenticatedUser;
	readonly permission: PermissionAdapter;
	readonly navigationList: readonly NavigationItem[];
	readonly activePath: string;
	readonly homePath: string;
	readonly onNavigate?: Navigate;
	readonly onLogout: () => void;
	readonly isActionPending?: boolean;
};

export const Sidebar = ({
	brand,
	user,
	permission,
	navigationList,
	activePath,
	homePath,
	onNavigate,
	onLogout,
	isActionPending = false,
}: SidebarProps) => {
	const brandLogoRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		syncBrandFavicon(document, brandLogoRef.current);
	}, [brand.logo, brand.token]);

	return (
		<aside
			className="
     fixed inset-y-0 left-0 z-20
     flex h-dvh w-58 flex-col
     overflow-hidden border-r border-border bg-surface
     px-4 py-6 max-[1360px]:w-52 max-[720px]:static
     max-[720px]:h-auto max-[720px]:w-full max-[720px]:border-r-0 max-[720px]:border-b
     max-[720px]:overflow-visible max-[720px]:p-4 print:hidden
   "
			aria-label="관리자 사이드바"
		>
			<BrandHomeLink homePath={homePath} onNavigate={onNavigate}>
				{brand.logo && (
					<span
						ref={brandLogoRef}
						className="inline-flex shrink-0 *:max-h-10 *:max-w-10"
						aria-hidden="true"
					>
						{brand.logo}
					</span>
				)}
				<span>{brand.title}</span>
			</BrandHomeLink>
			<div className="min-h-0 flex-1 overflow-y-auto max-[720px]:overflow-visible">
				<Navigation
					itemList={navigationList}
					permission={permission}
					activePath={activePath}
					onNavigate={onNavigate}
				/>
			</div>
			<div
				className="
      mt-auto grid shrink-0 grid-cols-[minmax(0,1fr)_auto]
      items-center gap-x-2 border-t border-border
      bg-surface px-2 pt-4 max-[720px]:mt-3
    "
			>
				<div className="min-w-0">
					<strong className="block truncate">{user.displayName}</strong>
					{user.description && (
						<small className="block truncate text-text-muted">
							{user.description}
						</small>
					)}
				</div>
				<Button
					variant="secondary"
					type="button"
					onClick={onLogout}
					disabled={isActionPending}
					aria-busy={isActionPending}
					className="shrink-0"
				>
					로그아웃
				</Button>
			</div>
		</aside>
	);
};
