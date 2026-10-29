import type { AuthenticatedUser } from "@admin/contract/authentication";
import type { PermissionAdapter } from "@admin/contract/authorization";
import type {
	AdminBrand,
	Navigate,
	NavigationItem,
} from "@admin/contract/navigation";
import { Button } from "@admin/component/design-system";
import { Navigation } from "./Navigation";

type SidebarProps = {
	readonly brand: AdminBrand;
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
	<aside className="dix-admin-sidebar" aria-label="관리자 사이드바">
		<div className="dix-admin-brand">
			{brand.logo && (
				<span className="dix-admin-brand-logo" aria-hidden="true">
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
		<div className="dix-admin-user-profile">
			<strong>{user.displayName}</strong>
			{user.description && <small>{user.description}</small>}
			<Button
				variant="secondary"
				type="button"
				onClick={onLogout}
				disabled={isActionPending}
				aria-busy={isActionPending}
			>
				로그아웃
			</Button>
		</div>
	</aside>
);
