import { Button } from "@/component/ui/Button";
import type { ActiveToast } from "./overlay-contract";

const toastToneClassNameByTone = {
	info: "",
	success: "border-positive",
	error: "border-negative",
} as const;

export const ToastView = ({
	toast,
}: {
	readonly toast: ActiveToast | null;
}) => {
	const tone = toast?.option.tone ?? "info";
	return (
		<div
			className="pointer-events-none fixed top-4 right-4 z-overlay max-w-[min(26rem,calc(100vw-2rem))]"
			data-toast-host=""
			role={tone === "error" ? "alert" : "status"}
			aria-atomic="true"
		>
			{toast && (
				<div
					className={`pointer-events-auto flex items-center gap-4 rounded-md border border-border bg-surface px-4 py-3 text-text shadow-overlay animate-overlay-enter motion-reduce:animate-none ${toastToneClassNameByTone[tone]}`}
				>
					<p className="m-0 [overflow-wrap:anywhere]">{toast.option.message}</p>
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
};
