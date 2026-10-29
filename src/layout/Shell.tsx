import { useId, type ReactNode } from "react";
import type { AuthAdapter } from "@/contract/authentication/auth-adapter";
import type { PermissionAdapter } from "@/contract/authorization/permission-adapter";
import type {
	Brand,
	Navigate,
	NavigationItem,
} from "@/contract/navigation/navigation-contract";
import { AuthBoundary } from "@/component/authentication/AuthBoundary";
import { Sidebar } from "./Sidebar";

export type ShellProps = {
	readonly auth: AuthAdapter;
	readonly permission: PermissionAdapter;
	readonly brand: Brand;
	readonly navigationList: readonly NavigationItem[];
	readonly activePath: string;
	readonly routeTitle?: string;
	readonly onNavigate?: Navigate;
	readonly children: ReactNode;
};

export const Shell = ({
	auth,
	permission,
	brand,
	navigationList,
	activePath,
	routeTitle,
	onNavigate,
	children: child,
}: ShellProps) => {
	const mainId = useId();
	const title = routeTitle ? `${routeTitle} | ${brand.title}` : brand.title;
	return (
		<div
			data-theme-root=""
			className="min-h-dvh bg-canvas font-sans text-body leading-[1.5] tracking-[-0.01em] text-text [word-break:keep-all]"
			style={brand.token}
		>
			<title>{title}</title>
			<AuthBoundary auth={auth}>
				{(user) => (
					<>
						<a
							className="absolute left-2 top-2 z-30 -translate-y-[160%] rounded-sm bg-surface px-3.5 py-2.5 text-text focus:translate-y-0"
							href={`#${mainId}`}
						>
							본문 바로가기
						</a>
						<div className="flex min-h-dvh max-[720px]:block">
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
							<main
								id={mainId}
								className="relative ml-[232px] min-w-0 flex-1 px-8 pt-6 pb-24 max-[1360px]:ml-[208px] max-[1360px]:px-6 max-[720px]:ml-0 max-[720px]:px-4 max-[720px]:pt-5 max-[720px]:pb-16 print:ml-0 print:p-0"
								tabIndex={-1}
							>
								{child}
							</main>
						</div>
					</>
				)}
			</AuthBoundary>
		</div>
	);
};
