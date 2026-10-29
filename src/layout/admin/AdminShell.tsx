import { useId, type ReactNode } from "react";
import type { AuthAdapter } from "@admin/contract/authentication";
import type { PermissionAdapter } from "@admin/contract/authorization";
import type {
	AdminBrand,
	Navigate,
	NavigationItem,
} from "@admin/contract/navigation";
import { AuthBoundary } from "@admin/component/authentication";
import { Sidebar } from "./Sidebar";
import "@admin/style/shell.css";

export type AdminShellProps = {
	readonly auth: AuthAdapter;
	readonly permission: PermissionAdapter;
	readonly brand: AdminBrand;
	readonly navigationList: readonly NavigationItem[];
	readonly activePath: string;
	readonly routeTitle?: string;
	readonly onNavigate?: Navigate;
	readonly children: ReactNode;
};

export const AdminShell = ({
	auth,
	permission,
	brand,
	navigationList,
	activePath,
	routeTitle,
	onNavigate,
	children: child,
}: AdminShellProps) => {
	const mainId = useId();
	const title = routeTitle ? `${routeTitle} | ${brand.title}` : brand.title;
	return (
		<div className="dix-admin-theme dix-admin-shell-root" style={brand.token}>
			<title>{title}</title>
			<AuthBoundary auth={auth}>
				{(user) => (
					<>
						<a className="dix-admin-skip-link" href={`#${mainId}`}>
							본문 바로가기
						</a>
						<div className="dix-admin-shell">
							<Sidebar
								brand={brand}
								user={user}
								permission={permission}
								navigationList={navigationList}
								activePath={activePath}
								onNavigate={onNavigate}
								onLogout={auth.logout}
								isActionPending={auth.isActionPending}
							/>
							<main id={mainId} className="dix-admin-main" tabIndex={-1}>
								{child}
							</main>
						</div>
					</>
				)}
			</AuthBoundary>
		</div>
	);
};
