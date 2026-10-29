import { type ReactNode, useId } from "react";

import { AuthBoundary } from "@/component/authentication/AuthBoundary";
import { DocumentTitle } from "@/component/metadata/DocumentTitle";
import type { AuthAdapter } from "@/contract/authentication/auth-adapter";
import type { PermissionAdapter } from "@/contract/authorization/permission-adapter";
import type {
	Brand,
	Navigate,
	NavigationItem,
} from "@/contract/navigation/navigation-contract";

import { Sidebar } from "./Sidebar";

export type ShellProps = {
	readonly auth: AuthAdapter;
	readonly permission: PermissionAdapter;
	readonly brand: Brand;
	readonly navigationList: readonly NavigationItem[];
	readonly activePath: string;
	readonly homePath: string;
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
	homePath,
	routeTitle,
	onNavigate,
	children: child,
}: ShellProps) => {
	const mainId = useId();
	const title = routeTitle ? `${routeTitle} | ${brand.title}` : brand.title;
	return (
		<DocumentTitle path={activePath} title={title}>
			<div
				data-theme-root=""
				className="
      min-h-dvh bg-canvas font-sans text-body
      leading-normal tracking-[-0.01em] text-text break-keep
    "
				style={brand.token}
			>
				<AuthBoundary auth={auth}>
					{(user) => (
						<>
							<a
								className="
          absolute left-2 top-2 z-30
          translate-y-[-160%] rounded-sm bg-surface px-3.5
          py-2.5 text-text focus:translate-y-0
        "
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
									homePath={homePath}
									onNavigate={onNavigate}
									onLogout={auth.logout}
									isActionPending={auth.isActionPending}
								/>
								<main
									id={mainId}
									className="
           relative ml-58 min-w-0 flex-1
           px-8 pt-6 pb-24 max-[1360px]:ml-52
           max-[1360px]:px-6 max-[720px]:ml-0 max-[720px]:px-4 max-[720px]:pt-5
           max-[720px]:pb-16 print:ml-0 print:p-0
         "
									tabIndex={-1}
								>
									<div className="w-full min-w-0 max-w-360">{child}</div>
								</main>
							</div>
						</>
					)}
				</AuthBoundary>
			</div>
		</DocumentTitle>
	);
};
