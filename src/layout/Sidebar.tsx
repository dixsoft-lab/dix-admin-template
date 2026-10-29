import type { AuthenticatedUser } from "@/contract/authentication/authenticated-user";
import type { PermissionAdapter } from "@/contract/authorization/permission-adapter";
import type {
	Brand,
	Navigate,
	NavigationItem,
} from "@/contract/navigation/navigation-contract";
import { Button } from "@/component/ui/Button";
import { Navigation } from "./Navigation";

type SidebarProps = {
	readonly brand: Brand;
	readonly user: AuthenticatedUser;
	readonly permission: PermissionAdapter;
	readonly navigationList: readonly NavigationItem[];
	readonly activePath: string;
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
	onNavigate,
	onLogout,
	isActionPending = false,
}: SidebarProps) => (
	<aside
		className="fixed inset-y-0 left-0 z-20 flex h-dvh w-[232px] flex-col overflow-y-auto border-r border-border bg-surface px-4 py-6 max-[1360px]:w-[208px] max-[720px]:static max-[720px]:h-auto max-[720px]:w-full max-[720px]:border-r-0 max-[720px]:border-b max-[720px]:p-4 print:hidden"
		aria-label="관리자 사이드바"
	>
		<div className="flex items-center gap-2 border-b border-border px-2 pb-5 font-bold">
			{brand.logo && (
				<span
					className="inline-flex shrink-0 [&>*]:max-h-10 [&>*]:max-w-10"
					aria-hidden="true"
				>
					{brand.logo}
				</span>
			)}
			<span>{brand.title}</span>
		</div>
		<Navigation
			itemList={navigationList}
			permission={permission}
			activePath={activePath}
			onNavigate={onNavigate}
		/>
		<div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 border-t border-border px-2 pt-4 max-[720px]:mt-3">
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
