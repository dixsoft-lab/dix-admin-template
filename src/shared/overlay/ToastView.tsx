import { Button } from "@admin/shared/design-system";
import type { ActiveToast } from "./overlay-contract";

export const ToastView = ({
	toast,
}: {
	readonly toast: ActiveToast | null;
}) => (
	<div
		className="dix-admin-toast-host"
		data-dix-admin-toast-host=""
		role={toast?.option.tone === "error" ? "alert" : "status"}
		aria-atomic="true"
	>
		{toast && (
			<div
				className={`dix-admin-toast dix-admin-toast--${toast.option.tone ?? "info"}`}
			>
				<p>{toast.option.message}</p>
				<Button
					variant="secondary"
					aria-label="알림 닫기"
					onClick={toast.controller.dismiss}
				>
					닫기
				</Button>
			</div>
		)}
	</div>
);
